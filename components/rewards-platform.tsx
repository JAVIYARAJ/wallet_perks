'use client'

import { FormEvent, useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  ArrowRight, ArrowUp, ArrowDown, Bell, Building2, Check, ChevronRight, CircleHelp, Clock3, Eye, EyeOff, Gift,
  LayoutDashboard, LogOut, Menu, MoreHorizontal, Search, ShieldCheck, Sparkles, Users, X,
  Star, Zap, Smartphone, TrendingUp, HelpCircle, BarChart3, QrCode, Heart, Award, CheckCircle2, ChevronDown, Flame, DollarSign, Coffee, ShoppingBag, Dumbbell, Scissors, Utensils, MapPin, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signUpUser, signInUser, signOutUser } from '@/lib/supabase/auth'
import { MapLocationPicker } from '@/components/map-location-picker'

import { Compass, Home } from 'lucide-react'

type Screen = 'landing' | 'register' | 'login' | 'pending' | 'rejected' | 'admin' | 'business' | 'notFound'
type Registration = { businessName: string; legalName: string; ownerName: string; email: string; phone: string; industry: string; website: string; address: string; description: string; rejectionReason?: string }
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@loyalty.local'
const initialRegistration: Registration = { businessName: '', legalName: '', ownerName: '', email: '', phone: '', industry: '', website: '', address: '', description: '' }

function Brand() {
  return (
    <div className="auth-brand">
      <div className="brand-icon-wrapper">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-svg">
          {/* Outer glow aura */}
          <rect x="2" y="5" width="28" height="22" rx="6" fill="url(#wpGrad1)" />
          {/* Card header strip */}
          <path d="M2 11C2 7.68629 4.68629 5 8 5H24C27.3137 5 30 7.68629 30 11V12H2V11Z" fill="white" fillOpacity="0.18" />
          {/* Card magnetic chip / balance indicator */}
          <rect x="6" y="16" width="7" height="5" rx="1.5" fill="#FCD34D" fillOpacity="0.9" />
          {/* Perk Star Badge */}
          <circle cx="22" cy="18.5" r="4.5" fill="url(#wpBadgeGrad)" />
          <path d="M22 15.2L22.8 17.4L25 18.5L22.8 19.6L22 21.8L21.2 19.6L19 18.5L21.2 17.4L22 15.2Z" fill="white" />
          <defs>
            <linearGradient id="wpGrad1" x1="2" y1="5" x2="30" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="0.5" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#9333EA" />
            </linearGradient>
            <linearGradient id="wpBadgeGrad" x1="17.5" y1="14" x2="26.5" y2="23" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="brand-text">
        <span className="brand-name-main">Wallet</span>
        <span className="brand-name-accent">Perks</span>
        <span className="brand-dot">.</span>
      </span>
    </div>
  )
}
function Field({ label, name, value, onChange, type = 'text', required = true, placeholder }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void; type?: string; required?: boolean; placeholder?: string }) { return <label className="auth-field"><span>{label}{required && <b aria-hidden="true">*</b>}</span><input name={name} type={type} value={value} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} required={required} /></label> }
function AuthLayout({ children, onBack }: { children: React.ReactNode; onBack: () => void }) { return <main className="auth-page"><div className="auth-top"><Brand /><button className="back-link" onClick={onBack}>Back to home</button></div>{children}<footer>Trusted by growing businesses to build lasting customer relationships.</footer></main> }


function Landing({ onRegister, onLogin }: { onRegister: () => void; onLogin: () => void }) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'card' | 'feed'>('analytics')
  const [stamps, setStamps] = useState(3)
  const [stampUnlocked, setStampUnlocked] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleAddStamp = () => {
    if (stamps >= 5) {
      setStamps(6)
      setStampUnlocked(true)
    } else {
      setStamps(stamps + 1)
      setStampUnlocked(false)
    }
  }

  const resetStamps = () => {
    setStamps(1)
    setStampUnlocked(false)
  }

  const faqs = [
    {
      q: "How does Loyalty work for my customers?",
      a: "Customers simply scan a QR code at your register or tap an NFC card to access their digital loyalty card directly on their phone. Zero app downloads required!"
    },
    {
      q: "Do I need special hardware or POS integrations?",
      a: "No extra hardware required! Works smoothly alongside any POS or independently on any phone, tablet, or web browser in under 2 minutes."
    },
    {
      q: "How does the business approval review process work?",
      a: "To protect network trust and quality, our dedicated team reviews every application within 24 hours before activating your business workspace."
    },
    {
      q: "Can I customize my rewards, points, and digital pass branding?",
      a: "Absolutely! Customize colors, logos, reward rules (e.g. 1 stamp per visit, or 10 points per dollar), and special VIP tier perks in your workspace."
    },
    {
      q: "What is the pricing after the free trial?",
      a: "Our flat plans start at $29/mo with transparent pricing, zero hidden fees, and unlimited customer check-ins."
    }
  ]

  return (
    <main className="landing-page-v2">
      {/* Sticky Header Navbar */}
      <header className="landing-nav-v2">
        <Brand />
        <nav className="nav-links-desktop">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#demo">Live Demo</a>
          <a href="#testimonials">Stories</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="landing-actions">
          <button className="back-link" onClick={onLogin}>Sign in</button>
          <Button onClick={onRegister} className="cta-glow-button">
            Register business <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="demo" className="hero-v2">
        <div className="hero-copy-v2">
          <h1>
            Turn Every Visitor Into a <br />
            <span className="gradient-text">Lifelong Regular.</span>
          </h1>

          <p className="hero-subtext">
            The all-in-one loyalty & customer re-engagement platform built for coffee shops, boutiques, fitness studios, and local spots. Keep your tables full and revenue recurring.
          </p>

          <div className="hero-cta-group">
            <Button size="lg" onClick={onRegister} className="hero-primary-btn">
              Register your business <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <button className="secondary-demo-btn" onClick={onLogin}>
              <span>Already a member?</span>
              <strong>Sign in to Workspace →</strong>
            </button>
          </div>

          <div className="trust-strip">
            <div className="trust-item"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span>2-Min Instant Setup</span></div>
            <div className="trust-item"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span>No Hardware Needed</span></div>
            <div className="trust-item"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span>Digital Mobile Passes</span></div>
          </div>
        </div>

        {/* Hero Interactive Widget Container */}
        <div className="hero-widget-container">
          <div className="hero-interactive-frame">
            <div className="widget-header-tabs">
              <button 
                className={activeTab === 'analytics' ? 'tab-btn active' : 'tab-btn'}
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Analytics
              </button>
              <button 
                className={activeTab === 'card' ? 'tab-btn active' : 'tab-btn'}
                onClick={() => setActiveTab('card')}
              >
                <Smartphone className="w-3.5 h-3.5" /> Digital Pass Card
              </button>
              <button 
                className={activeTab === 'feed' ? 'tab-btn active' : 'tab-btn'}
                onClick={() => setActiveTab('feed')}
              >
                <Flame className="w-3.5 h-3.5" /> Live Activity
              </button>
            </div>

            <div className="widget-body">
              {activeTab === 'analytics' && (
                <div className="analytics-view">
                  <div className="stat-grid-row">
                    <div className="mini-stat-card">
                      <small>REPEAT VISIT RATE</small>
                      <strong>68.4%</strong>
                      <span className="stat-trend positive">+14.2% vs last mo</span>
                    </div>
                    <div className="mini-stat-card">
                      <small>REDEEMED REWARDS</small>
                      <strong>1,284</strong>
                      <span className="stat-trend positive">+8.5% growth</span>
                    </div>
                  </div>

                  <div className="chart-preview-container">
                    <div className="chart-title-row">
                      <span>Weekly Retention Momentum</span>
                      <span className="live-dot"><i /> Live</span>
                    </div>
                    <div className="visual-chart-bars">
                      <div className="bar-wrapper"><div className="bar-fill h-40"></div><small>Mon</small></div>
                      <div className="bar-wrapper"><div className="bar-fill h-60"></div><small>Tue</small></div>
                      <div className="bar-wrapper"><div className="bar-fill h-45"></div><small>Wed</small></div>
                      <div className="bar-wrapper"><div className="bar-fill h-75"></div><small>Thu</small></div>
                      <div className="bar-wrapper"><div className="bar-fill h-90 highlight"></div><small>Fri</small></div>
                      <div className="bar-wrapper"><div className="bar-fill h-100 highlight"></div><small>Sat</small></div>
                      <div className="bar-wrapper"><div className="bar-fill h-80"></div><small>Sun</small></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'card' && (
                <div className="digital-card-view">
                  <div className="wallet-pass-card">
                    <div className="pass-top">
                      <div className="pass-brand">
                        <Coffee className="w-5 h-5 text-amber-400" />
                        <span>Northstar Coffee</span>
                      </div>
                      <span className="pass-tier">VIP GOLD</span>
                    </div>

                    <div className="stamp-grid">
                      {[1, 2, 3, 4, 5, 6].map((slot) => (
                        <div key={slot} className={`stamp-slot ${slot <= stamps ? 'filled' : ''}`}>
                          {slot <= stamps ? <Sparkles className="w-4 h-4 text-amber-300" /> : <small>{slot}</small>}
                        </div>
                      ))}
                    </div>

                    <div className="pass-footer">
                      <p>{stamps >= 6 ? "🎉 Free Signature Latte Unlocked!" : `${6 - stamps} more visits until Free Latte`}</p>
                      {stampUnlocked ? (
                        <button className="reset-stamp-btn" onClick={resetStamps}>Reset Demo Pass</button>
                      ) : (
                        <button className="add-stamp-btn" onClick={handleAddStamp}>
                          <Zap className="w-3.5 h-3.5 mr-1 text-amber-300 fill-amber-300" /> Tap to Add Stamp
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'feed' && (
                <div className="activity-feed-view">
                  <div className="feed-item">
                    <div className="feed-avatar bg-indigo-500">JD</div>
                    <div className="feed-info">
                      <strong>Jordan D. earned 50 pts</strong>
                      <small>Checked in at Main St Cafe • 2 mins ago</small>
                    </div>
                    <span className="feed-badge">+50 pts</span>
                  </div>
                  <div className="feed-item">
                    <div className="feed-avatar bg-emerald-500">OM</div>
                    <div className="feed-info">
                      <strong>Olivia M. redeemed reward</strong>
                      <small>Unlocked Free Iced Coffee • 5 mins ago</small>
                    </div>
                    <span className="feed-badge reward">Reward!</span>
                  </div>
                  <div className="feed-item">
                    <div className="feed-avatar bg-amber-500">AR</div>
                    <div className="feed-info">
                      <strong>Alex R. reached Gold Tier</strong>
                      <small>Unlocked 15% bonus rewards • 12 mins ago</small>
                    </div>
                    <span className="feed-badge tier">Gold Tier</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="floating-hero-pill">
            <span className="pill-avatar bg-rose-500">OM</span>
            <div>
              <strong>Olivia M. just redeemed!</strong>
              <small>Free Signature Latte • 2m ago</small>
            </div>
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

      </section>

      {/* Category Icons Bar */}
      <section className="category-strip">
        <p className="category-title">POWERING RETENTION FOR LOCAL FAVORITES EVERYWHERE</p>
        <div className="category-grid">
          <div className="cat-chip"><Coffee className="w-4 h-4" /> Coffee Shops</div>
          <div className="cat-chip"><ShoppingBag className="w-4 h-4" /> Retail Boutiques</div>
          <div className="cat-chip"><Dumbbell className="w-4 h-4" /> Fitness Studios</div>
          <div className="cat-chip"><Scissors className="w-4 h-4" /> Salons & Spas</div>
          <div className="cat-chip"><Utensils className="w-4 h-4" /> Restaurants</div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="bento-section">
        <div className="section-header-center">
          <div className="eyebrow-tag">BUILT FOR MODERN GROWTH</div>
          <h2>Everything you need to keep customers returning</h2>
          <p>Ditch paper punch cards and clunky apps. Give customers a delightful experience right in their mobile wallet.</p>
        </div>

        <div className="bento-grid">
          {/* Card 1 Large */}
          <div className="bento-card col-span-2">
            <div className="bento-icon-wrap bg-purple-500/10 text-purple-600">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3>Digital Loyalty Cards</h3>
            <p>Zero friction for customers. Loyalty passes work instantly in any mobile browser with real-time balance updates and instant QR scanning at your register.</p>
            <div className="bento-mockup-bar">
              <div className="mockup-pill"><QrCode className="w-3.5 h-3.5" /> Instant Scan</div>
              <div className="mockup-pill"><Bell className="w-3.5 h-3.5" /> Geo Notifications</div>
              <div className="mockup-pill"><ShieldCheck className="w-3.5 h-3.5" /> Fraud-proof</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bento-card">
            <div className="bento-icon-wrap bg-amber-500/10 text-amber-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3>Automated Re-engagement</h3>
            <p>Automatically send a gentle nudge or special offer when a customer hasn't visited in 14+ days.</p>
          </div>

          {/* Card 3 */}
          <div className="bento-card">
            <div className="bento-icon-wrap bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3>Customer Lifetime Value Analytics</h3>
            <p>Track visit frequency, average spend, top regulars, and peak store hours in real-time dashboards.</p>
          </div>

          {/* Card 4 Large */}
          <div className="bento-card col-span-2">
            <div className="bento-icon-wrap bg-indigo-500/10 text-indigo-600">
              <Award className="w-6 h-6" />
            </div>
            <h3>Custom Tiered Loyalty Perks</h3>
            <p>Gamify the experience with Bronze, Silver, and Gold VIP tiers. Reward your most loyal 20% of customers who drive 80% of your business profit.</p>
            <div className="tier-pills-row">
              <span className="tier-badge bronze">Bronze Member</span>
              <span className="tier-badge silver">Silver VIP</span>
              <span className="tier-badge gold">Gold Regular • 1.5x Points</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bento-section">
        <div className="section-header-center">
          <div className="eyebrow-tag">SIMPLE 3-STEP PROCESS</div>
          <h2>How WalletPerks works for your store</h2>
          <p>Launch your business loyalty program in under 3 minutes with zero extra hardware.</p>
        </div>

        <div className="bento-grid mt-8">
          <div className="bento-card">
            <div className="bento-icon-wrap bg-indigo-500/10 text-indigo-400 font-extrabold text-lg">
              1
            </div>
            <h3>1. Set Up Your Program</h3>
            <p>Define stamp rules (e.g. 1 stamp per coffee visit), reward perks, and upload your logo in your business workspace.</p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-wrap bg-purple-500/10 text-purple-400 font-extrabold text-lg">
              2
            </div>
            <h3>2. Display Counter QR Code</h3>
            <p>Place your store's unique QR code at your register counter, tables, or on receipts for customers to scan.</p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-wrap bg-emerald-500/10 text-emerald-400 font-extrabold text-lg">
              3
            </div>
            <h3>3. Customers Scan & Return</h3>
            <p>Customers scan in seconds to collect stamps on their mobile phone, earning rewards that keep them coming back.</p>
          </div>
        </div>
      </section>

      {/* Social Proof & Stories */}
      <section id="testimonials" className="stories-section">
        <div className="section-header-center">
          <div className="eyebrow-tag">LOVE FROM BUSINESS OWNERS</div>
          <h2>Loved by local founders & store managers</h2>
        </div>

        <div className="stories-grid">
          <div className="story-card">
            <div className="star-row">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p>&ldquo;Loyalty transformed our weekend morning rush. Our repeat coffee regulars increased by 42% in just two months without any paper stamp card hassles!&rdquo;</p>
            <div className="author-row">
              <div className="author-avatar bg-amber-600">JD</div>
              <div>
                <strong>Jordan Davis</strong>
                <small>Founder, Northstar Coffee LLC</small>
              </div>
            </div>
          </div>

          <div className="story-card">
            <div className="star-row">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p>&ldquo;The digital loyalty card feature is a hit. Customers love scanning their phone at checkout, and our re-engagement campaign brought back 80+ lost customers.&rdquo;</p>
            <div className="author-row">
              <div className="author-avatar bg-indigo-600">MC</div>
              <div>
                <strong>Maya Chen</strong>
                <small>Owner, Morrow Goods Retail</small>
              </div>
            </div>
          </div>

          <div className="story-card">
            <div className="star-row">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p>&ldquo;Setup took literally 3 minutes. The business application review was quick, and the workspace dashboard gives us total visibility into customer return rates.&rdquo;</p>
            <div className="author-row">
              <div className="author-avatar bg-emerald-600">RL</div>
              <div>
                <strong>Ryan Lin</strong>
                <small>Head of Ops, Elevate Fitness</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="faq-section">
        <div className="section-header-center">
          <div className="eyebrow-tag">FREQUENTLY ASKED QUESTIONS</div>
          <h2>Everything you need to know</h2>
        </div>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openFaq === index ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div className="faq-question">
                <h3>{faq.q}</h3>
                <ChevronDown className="w-4 h-4 faq-chevron" />
              </div>
              {openFaq === index && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* High Impact Final CTA Banner */}
      <section className="cta-banner-section">
        <div className="cta-card">
          <h2>Ready to grow your regular customer base?</h2>
          <p>Join hundreds of modern local businesses building lasting customer relationships today.</p>
          <div className="cta-actions-row">
            <Button size="lg" onClick={onRegister} className="bg-white text-indigo-950 hover:bg-slate-100 font-bold px-8">
              Register Your Business Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <small className="cta-footer-note">✓ 14-day free trial • No credit card required • Instant setup</small>
        </div>
      </section>

      {/* Rich Landing Footer */}
      <footer className="landing-footer-v2">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <Brand />
            <p>The universal customer loyalty & re-engagement platform built for growing modern businesses.</p>
            <div className="system-status-pill">
              <span className="status-dot-green" /> All Systems Operational
            </div>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Digital Pass Cards</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Smart Re-engagement</a>
            <a href="#demo">Live Demo</a>
          </div>

          <div className="footer-col">
            <h4>Businesses</h4>
            <a href="#testimonials">Coffee & Cafes</a>
            <a href="#testimonials">Boutiques & Retail</a>
            <a href="#testimonials">Fitness & Studios</a>
            <a href="#testimonials">Restaurants & Bars</a>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <button onClick={onLogin} className="footer-link-btn">Sign In to Workspace</button>
            <button onClick={onRegister} className="footer-link-btn">Register New Business</button>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} WalletPerks. All rights reserved.</p>
          <div className="footer-legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
          </div>
        </div>
      </footer>
    </main>
  )
}


function Register({ onBack, onSubmit }: { onBack: () => void; onSubmit: (registration: Registration) => void }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState(initialRegistration)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Address search state connected to Node backend API (/api/address/search)
  const [addressQuery, setAddressQuery] = useState(form.address)
  const [addressSuggestions, setAddressSuggestions] = useState<{ placeId: string; description: string; mainText: string; secondaryText: string }[]>([])
  const [showAddressDropdown, setShowAddressDropdown] = useState(false)
  const [addressSearching, setAddressSearching] = useState(false)
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false)

  const addressContainerRef = useRef<HTMLDivElement>(null)
  const isSelectingAddressRef = useRef(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressContainerRef.current &&
        !addressContainerRef.current.contains(event.target as Node)
      ) {
        setShowAddressDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const requestUserLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator && !userCoords) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        },
        () => {},
        { timeout: 5000 }
      )
    }
  }

  useEffect(() => {
    // If address was just selected from dropdown, do not re-trigger API search
    if (isSelectingAddressRef.current) {
      isSelectingAddressRef.current = false
      return
    }

    if (!addressQuery || addressQuery.trim().length < 2) {
      setAddressSuggestions([])
      setShowAddressDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setAddressSearching(true)
      try {
        const locParams = userCoords ? `&lat=${userCoords.lat}&lon=${userCoords.lon}` : ''
        console.log('Fetching address suggestions with location bias:', addressQuery, userCoords)
        const res = await fetch(`/api/address/search?q=${encodeURIComponent(addressQuery)}${locParams}`)
        const data = await res.json()
        if (data.suggestions && data.suggestions.length > 0) {
          setAddressSuggestions(data.suggestions)
          setShowAddressDropdown(true)
        } else {
          setShowAddressDropdown(false)
        }
      } catch (e) {
        console.error('Failed to search address:', e)
      } finally {
        setAddressSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [addressQuery, userCoords])

  const handleSelectAddress = (desc: string) => {
    isSelectingAddressRef.current = true
    setAddressQuery(desc)
    update('address', desc)
    setAddressSuggestions([])
    setShowAddressDropdown(false)
  }

  const update = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }))

  const handleIndustrySelect = (ind: string) => {
    update('industry', ind)
  }

  function handleNextStep(e: FormEvent) {
    e.preventDefault()
    if (!form.businessName || !form.address || !form.description) {
      return setError('Please fill in all required business fields.')
    }
    setError('')
    setStep(2)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (password.length < 8) return setError('Please use a password with at least 8 characters.')
    if (!consent) return setError('Please accept the terms to submit your application.')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/business/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          password: password,
          latitude: userCoords?.lat || null,
          longitude: userCoords?.lon || null,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to submit business application.')
      }

      onSubmit(form)
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const [industryOptions, setIndustryOptions] = useState<{ label: string; iconName: string }[]>([
    { label: 'Coffee & Cafe', iconName: 'Coffee' },
    { label: 'Retail & Boutique', iconName: 'ShoppingBag' },
    { label: 'Fitness & Studio', iconName: 'Dumbbell' },
    { label: 'Salon & Spa', iconName: 'Scissors' },
    { label: 'Restaurant & Bar', iconName: 'Utensils' },
  ])

  const fetchedIndustriesRef = useRef(false)

  // Fetch categories from Node API endpoint (/api/industries)
  useEffect(() => {
    if (fetchedIndustriesRef.current) return
    fetchedIndustriesRef.current = true

    async function fetchIndustries() {
      try {
        const res = await fetch('/api/industries')
        const data = await res.json()
        if (data.industries && data.industries.length > 0) {
          setIndustryOptions(
            data.industries.map((item: any) => ({
              label: item.label,
              iconName: item.iconName,
            }))
          )
        }
      } catch (e) {
        console.error('Failed to fetch industries from API:', e)
      }
    }
    fetchIndustries()
  }, [])

  return (
    <AuthLayout onBack={onBack}>
      <div className="register-v2-container">
        {/* Left Side: Trust & Benefits Hero Rail */}
        <div className="register-sidebar-v2">
          <div className="sidebar-badge">
            <Sparkles className="w-3.5 h-3.5" /> Fast Business Setup
          </div>
          <h2>Transform repeat visits with digital wallet loyalty.</h2>
          <p>Create your business account once. Our team reviews and activates your workspace within 24 hours.</p>

          <div className="register-benefits-list">
            <div className="benefit-item">
              <div className="benefit-icon"><Zap className="w-4 h-4 text-amber-400" /></div>
              <div>
                <strong>Instant Setup</strong>
                <small>No hardware or POS replacement required.</small>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon"><Smartphone className="w-4 h-4 text-purple-400" /></div>
              <div>
                <strong>Mobile Loyalty Pass</strong>
                <small>Passes accessible directly on customer smartphones.</small>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon"><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
              <div>
                <strong>32% Retention Boost</strong>
                <small>Turn casual visitors into daily regulars.</small>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon"><ShieldCheck className="w-4 h-4 text-blue-400" /></div>
              <div>
                <strong>Fraud-Proof Stamps</strong>
                <small>Encrypted mobile scanning & verification.</small>
              </div>
            </div>
          </div>

          <div className="sidebar-quote-card">
            <p>“Setup took literally 3 minutes. Our weekend regulars love tapping their phones!”</p>
            <div className="quote-author">
              <div className="quote-avatar">JD</div>
              <div>
                <strong>Jordan Davis</strong>
                <small>Founder, Northstar Coffee</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Step Form Card */}
        <div className="register-form-card-v2">
          {/* Step Indicator Header */}
          <div className="register-steps-header">
            <div className={`step-chip ${step === 1 ? 'active' : 'completed'}`}>
              <span className="step-num">{step > 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : '1'}</span>
              <span>1. Business Details</span>
            </div>
            <div className="step-connector" />
            <div className={`step-chip ${step === 2 ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span>2. Contact & Password</span>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="register-form-body">
              <div className="form-head">
                <h1>Tell us about your business</h1>
                <p>These details will be shown to your review team & regular customers.</p>
              </div>

              <div className="form-fields-grid">
                <div className="field-group">
                  <label>Business Name <b>*</b></label>
                  <input 
                    name="businessName" 
                    value={form.businessName} 
                    onChange={(e) => update('businessName', e.target.value)} 
                    placeholder="e.g. Northstar Coffee" 
                    required 
                  />
                </div>
                <div className="field-group">
                  <label>Legal Business Name</label>
                  <input 
                    name="legalName" 
                    value={form.legalName} 
                    onChange={(e) => update('legalName', e.target.value)} 
                    placeholder="e.g. Northstar Coffee LLC" 
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Select Category / Industry <b>*</b></label>
                <div className="industry-chips-grid">
                  {industryOptions.map((opt) => {
                    const ICON_MAP: Record<string, any> = {
                      Coffee: Coffee,
                      ShoppingBag: ShoppingBag,
                      Dumbbell: Dumbbell,
                      Scissors: Scissors,
                      Utensils: Utensils,
                    }
                    const Icon = ICON_MAP[opt.iconName] || Coffee
                    const isSelected = form.industry === opt.label
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        className={`industry-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleIndustrySelect(opt.label)}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="form-fields-grid">
                <div className="field-group">
                  <label>Website or Social Link</label>
                  <input 
                    name="website" 
                    value={form.website} 
                    onChange={(e) => update('website', e.target.value)} 
                    placeholder="https://yourbusiness.com" 
                  />
                </div>
                <div ref={addressContainerRef} className="field-group relative">
                  <label className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      Store Address <b>*</b>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMapPickerOpen(true)}
                        className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Pick on Map
                      </button>
                    </div>
                  </label>
                  <input 
                    name="address" 
                    value={addressQuery} 
                    onChange={(e) => {
                      setAddressQuery(e.target.value)
                      update('address', e.target.value)
                    }} 
                    onFocus={() => {
                      requestUserLocation()
                      if (addressSuggestions.length > 0) setShowAddressDropdown(true)
                    }}
                    placeholder="Type store address or location..." 
                    required 
                    autoComplete="off"
                  />
                  {showAddressDropdown && addressSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[100%] mt-1.5 z-50 bg-white border border-indigo-100 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {addressSuggestions.map((item) => (
                        <button
                          key={item.placeId}
                          type="button"
                          className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50/80 transition-colors flex items-start gap-2.5 cursor-pointer text-slate-800"
                          onClick={() => handleSelectAddress(item.description)}
                        >
                          <Building2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <strong className="text-xs font-semibold text-slate-900 truncate">{item.mainText}</strong>
                            <small className="text-[11px] text-slate-500 truncate">{item.secondaryText}</small>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="field-group">
                <label>Business Description <b>*</b></label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={(e) => update('description', e.target.value)} 
                  placeholder="Tell us what makes your store, café or studio special..." 
                  rows={3} 
                  required 
                />
              </div>

              {error && <div className="form-error-v2">{error}</div>}

              <div className="register-actions-row">
                <button type="button" className="btn-cancel" onClick={onBack}>
                  Cancel
                </button>
                <Button type="submit" className="btn-continue">
                  Continue to Contact Info <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={submit} className="register-form-body">
              <div className="form-head">
                <h1>Owner & Workspace Security</h1>
                <p>Create your primary admin account to manage your loyalty program.</p>
              </div>

              <div className="form-fields-grid">
                <div className="field-group">
                  <label>Owner / Contact Full Name <b>*</b></label>
                  <input 
                    name="ownerName" 
                    value={form.ownerName} 
                    onChange={(e) => update('ownerName', e.target.value)} 
                    placeholder="Jordan Davis" 
                    required 
                  />
                </div>
                <div className="field-group">
                  <label>Work Email Address <b>*</b></label>
                  <input 
                    type="email"
                    name="email" 
                    value={form.email} 
                    onChange={(e) => update('email', e.target.value)} 
                    placeholder="you@yourbusiness.com" 
                    required 
                  />
                </div>
              </div>

              <div className="form-fields-grid">
                <div className="field-group">
                  <label>Phone Number <b>*</b></label>
                  <input 
                    type="tel"
                    name="phone" 
                    value={form.phone} 
                    onChange={(e) => update('phone', e.target.value)} 
                    placeholder="(512) 555-0123" 
                    required 
                  />
                </div>
                <div className="field-group">
                  <label>Password <b>*</b></label>
                  <div className="password-input-wrap">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="At least 8 characters" 
                      minLength={8} 
                      required 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <label className="terms-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={consent} 
                  onChange={(e) => setConsent(e.target.checked)} 
                />
                <span>I confirm I am authorized to represent this business and agree to the <strong>Terms of Service</strong> & <strong>Privacy Policy</strong>.</span>
              </label>

              {error && <div className="form-error-v2">{error}</div>}

              <div className="register-actions-row">
                <button type="button" className="btn-cancel" onClick={() => setStep(1)}>
                  <ArrowRight className="w-4 h-4 mr-1.5 rotate-180" /> Back
                </button>
                <Button type="submit" disabled={loading} className="btn-continue highlight">
                  {loading ? 'Submitting...' : 'Submit Application for Review'} <CheckCircle2 className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          )}

          {/* Interactive Map Picker Modal */}
          <MapLocationPicker
            isOpen={isMapPickerOpen}
            onClose={() => setIsMapPickerOpen(false)}
            initialAddress={addressQuery}
            onSelectLocation={(selectedAddr, selectedLat, selectedLon) => {
              isSelectingAddressRef.current = true
              setAddressQuery(selectedAddr)
              update('address', selectedAddr)
              setUserCoords({ lat: selectedLat, lon: selectedLon })
              setAddressSuggestions([])
              setShowAddressDropdown(false)
            }}
          />
        </div>
      </div>
    </AuthLayout>
  )
}


function Login({ onBack, onLogin }: { onBack: () => void; onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email || !password) {
      return setError('Please enter your business email and password.')
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid login credentials. Please try again.')
      }

      onLogin(email)
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleDemoFill(demoEmail: string) {
    setEmail(demoEmail)
    setPassword('password123')
    setError('')
  }

  return (
    <AuthLayout onBack={onBack}>
      <div className="login-v2-container">
        {/* Left Side: Hero Rail */}
        <div className="login-sidebar-v2">
          <div className="sidebar-badge">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Workspace Sign In
          </div>
          <h2>Welcome back to your business workspace.</h2>
          <p>Sign in to manage your rewards, issue digital passes, track customer retention, and send push campaigns.</p>

          <div className="login-stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
              <div>
                <strong>32% Retention Boost</strong>
                <small>Average merchant customer return rate</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Smartphone className="w-4 h-4 text-purple-400" /></div>
              <div>
                <strong>Mobile Loyalty Ready</strong>
                <small>Instant digital loyalty passes active</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Zap className="w-4 h-4 text-amber-400" /></div>
              <div>
                <strong>Instant Redemption</strong>
                <small>Sub-second QR scanning at register</small>
              </div>
            </div>
          </div>


        </div>

        {/* Right Side: Form Card */}
        <div className="login-form-card-v2">
          <div className="form-head">
            <h1>Sign in to WalletPerks</h1>
            <p>Enter your account credentials to access your workspace dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form-body">
            <div className="field-group">
              <label>Work Email Address <b>*</b></label>
              <input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@yourbusiness.com" 
                required 
              />
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label>Password <b>*</b></label>
                <a href="#" className="forgot-password-link" onClick={(e) => { e.preventDefault(); alert('Demo reset link sent to ' + (email || 'your email')); }}>
                  Forgot password?
                </a>
              </div>
              <div className="password-input-wrap">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="terms-checkbox-label">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <span>Remember this device for 30 days</span>
            </label>

            {error && <div className="form-error-v2">{error}</div>}

            <Button type="submit" disabled={loading} className="btn-continue highlight w-full justify-center">
              {loading ? 'Signing in...' : 'Sign in to Workspace'} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="login-switch-footer">
            <span>New to WalletPerks?</span>
            <button type="button" onClick={onBack}>Register your business for free</button>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

function LockKeyholeIcon() { return <ShieldCheck aria-hidden="true" /> }

function Pending({
  registration,
  onSignOut,
  onRefreshStatus,
}: {
  registration: Registration
  onSignOut: () => void
  onRefreshStatus?: () => Promise<void>
}) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (onRefreshStatus) {
        await onRefreshStatus()
      }
    } finally {
      setTimeout(() => {
        setIsRefreshing(false)
      }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Full-width Top Navigation Header Bar */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-20 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Brand />
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <section className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-100/30 text-left">
          {/* Status Icon */}
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-5">
            <Clock3 className="w-7 h-7 animate-pulse" />
          </div>

          <div className="text-xs font-extrabold uppercase tracking-wider text-amber-600 mb-1">
            Application Received
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            We&apos;re reviewing your business
          </h1>
          
          <p className="text-slate-600 text-base leading-relaxed mb-6">
            Thanks for applying, <strong className="text-slate-900">{registration.ownerName || 'there'}</strong>. Our team reviews every business personally, then unlocks your workspace when everything looks right.
          </p>

          {/* Stepper Timeline with Larger Text */}
          <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6 flex flex-col gap-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-slate-900">1. Application submitted</strong>
                <span className="text-xs text-slate-500 mt-0.5">Your information is safely with our compliance team.</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs animate-pulse">
                <Clock3 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-amber-700">2. Team review in progress</strong>
                <span className="text-xs text-slate-600 font-medium mt-0.5">Usually completed within 24 business hours.</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5 opacity-50">
              <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                3
              </div>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-slate-700">3. Workspace access</strong>
                <span className="text-xs text-slate-500 mt-0.5">Full merchant dashboard unlocked upon approval.</span>
              </div>
            </div>
          </div>

          {/* Business Information Card */}
          <div className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 mb-6 flex flex-col gap-3.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Business Name</span>
              <strong className="font-bold text-slate-900">{registration.businessName || 'Your Business'}</strong>
            </div>

            {registration.legalName && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Legal Entity Name</span>
                <strong className="font-bold text-slate-900">{registration.legalName}</strong>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Owner / Applicant</span>
              <strong className="font-bold text-slate-900">{registration.ownerName || 'N/A'}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Application Status</span>
              <strong className="font-bold text-amber-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Pending Team Review
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Contact Email</span>
              <strong className="font-bold text-slate-900">{registration.email || 'Email registered'}</strong>
            </div>

            {registration.phone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Phone Number</span>
                <strong className="font-bold text-slate-900">{registration.phone}</strong>
              </div>
            )}

            {registration.industry && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Industry Category</span>
                <strong className="font-bold text-slate-900">{registration.industry}</strong>
              </div>
            )}

            {registration.address && (
              <div className="flex items-start justify-between pt-2 border-t border-indigo-100/80">
                <span className="text-slate-500 font-medium">Store Address</span>
                <strong className="font-bold text-slate-900 text-right max-w-[260px] leading-snug">{registration.address}</strong>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Checking...' : 'Refresh Status'}
            </Button>

            <a
              href={`mailto:support@loyalty.local?subject=Status%20Check%20-%20${encodeURIComponent(registration.businessName || 'Business')}`}
              className="flex-1 text-center py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

function RejectedStatus({ registration, onSignOut }: { registration: Registration; onSignOut: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-20 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Brand />
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <section className="w-full max-w-xl bg-white border border-red-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-red-100/20 text-left border-t-4 border-t-red-500">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mb-5">
            <X className="w-7 h-7" />
          </div>

          <div className="text-xs font-extrabold uppercase tracking-wider text-red-600 mb-1">
            Application Status
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Application Not Approved
          </h1>

          <p className="text-slate-600 text-base leading-relaxed mb-6">
            Thanks for applying, <strong className="text-slate-900">{registration.ownerName || 'there'}</strong>. Our compliance team was unable to approve <strong>{registration.businessName || 'your business application'}</strong> at this time.
          </p>

          {registration.rejectionReason && (
            <div className="w-full bg-red-50 border border-red-200/90 rounded-2xl p-5 mb-6 text-left shadow-xs">
              <strong className="block text-xs uppercase font-extrabold text-red-950 tracking-wider mb-1">
                Reason for Rejection:
              </strong>
              <p className="text-sm font-medium text-red-900 leading-relaxed">
                {registration.rejectionReason}
              </p>
            </div>
          )}

          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-sm text-slate-700">
            <strong className="font-semibold text-slate-900 block mb-1">Next Steps:</strong>
            <span>You can contact partner support to review or resubmit missing business verification documents.</span>
          </div>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Business Name</span>
              <strong className="font-bold text-slate-900">{registration.businessName || 'Your Business'}</strong>
            </div>
            {registration.legalName && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Legal Entity Name</span>
                <strong className="font-bold text-slate-900">{registration.legalName}</strong>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Owner / Applicant</span>
              <strong className="font-bold text-slate-900">{registration.ownerName || 'N/A'}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Contact Email</span>
              <strong className="font-bold text-slate-900">{registration.email || 'N/A'}</strong>
            </div>
            {registration.phone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Phone Number</span>
                <strong className="font-bold text-slate-900">{registration.phone}</strong>
              </div>
            )}
            {registration.industry && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Industry Category</span>
                <strong className="font-bold text-slate-900">{registration.industry}</strong>
              </div>
            )}
            {registration.address && (
              <div className="flex items-start justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Store Address</span>
                <strong className="font-bold text-slate-900 text-right max-w-[260px] leading-snug">{registration.address}</strong>
              </div>
            )}
          </div>

          <a
            href={`mailto:support@loyalty.local?subject=Application%20Rejection%20Inquiry%20-%20${encodeURIComponent(registration.businessName || 'Business')}`}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            Contact Partner Support
          </a>
        </section>
      </main>
    </div>
  )
}

function NotFoundScreen({ onGoHome }: { onGoHome: () => void }) {
  return (
    <main className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-indigo-100/30 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-5 shadow-inner">
          <Compass className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 mb-1">
          Error 404
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The link might be broken or the page may have been moved.
        </p>
        <Button
          onClick={onGoHome}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Home className="w-4 h-4 mr-1.5 inline-block" /> Back to Home
        </Button>
      </div>
    </main>
  )
}

function SortableHeader({
  label,
  field,
  currentField,
  currentDir,
  onSort,
  align = 'left',
}: {
  label: string
  field: string
  currentField: string
  currentDir: 'asc' | 'desc'
  onSort: (field: string) => void
  align?: 'left' | 'right' | 'center'
}) {
  const isActive = currentField === field
  return (
    <th
      onClick={() => onSort(field)}
      className={`py-3 px-5 cursor-pointer hover:bg-slate-100/90 transition-colors select-none group ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      }`}
    >
      <div className={`inline-flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
        <span className={isActive ? 'text-indigo-600 font-extrabold' : 'group-hover:text-slate-900'}>{label}</span>
        {isActive ? (
          currentDir === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
          )
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-slate-400 transition-colors" />
        )}
      </div>
    </th>
  )
}

function AdminPanel({ onSignOut }: { onSignOut: () => void }) {
  const [activeModule, setActiveModule] = useState<'applications' | 'overview' | 'businesses' | 'users' | 'settings'>('applications')
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [rejectionModalBiz, setRejectionModalBiz] = useState<any | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState('')

  // Users & Roles Module State
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'merchant' | 'customer'>('all')
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  // Business Column Sorting state
  const [bizSortField, setBizSortField] = useState<string>('created_at')
  const [bizSortDir, setBizSortDir] = useState<'asc' | 'desc'>('desc')

  // Users Column Sorting state
  const [userSortField, setUserSortField] = useState<string>('created_at')
  const [userSortDir, setUserSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSortBiz = (field: string) => {
    if (bizSortField === field) {
      setBizSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setBizSortField(field)
      setBizSortDir(field === 'created_at' ? 'desc' : 'asc')
    }
  }

  const handleSortUser = (field: string) => {
    if (userSortField === field) {
      setUserSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setUserSortField(field)
      setUserSortDir(field === 'created_at' ? 'desc' : 'asc')
    }
  }

  const sortedBusinesses = useMemo(() => {
    return [...businesses].sort((a, b) => {
      let valA = a[bizSortField] ?? ''
      let valB = b[bizSortField] ?? ''
      if (bizSortField === 'created_at') {
        valA = new Date(valA).getTime()
        valB = new Date(valB).getTime()
      } else {
        valA = String(valA).toLowerCase()
        valB = String(valB).toLowerCase()
      }
      if (valA < valB) return bizSortDir === 'asc' ? -1 : 1
      if (valA > valB) return bizSortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [businesses, bizSortField, bizSortDir])

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let valA = a[userSortField] ?? ''
      let valB = b[userSortField] ?? ''
      if (userSortField === 'created_at') {
        valA = new Date(valA).getTime()
        valB = new Date(valB).getTime()
      } else {
        valA = String(valA).toLowerCase()
        valB = String(valB).toLowerCase()
      }
      if (valA < valB) return userSortDir === 'asc' ? -1 : 1
      if (valA > valB) return userSortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [users, userSortField, userSortDir])

  const fetchBusinesses = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/api/admin/businesses?status=${statusFilter}&sort=${sortOrder}&search=${encodeURIComponent(searchQuery)}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success && data.businesses) {
        setBusinesses(data.businesses)
      }
    } catch (err) {
      console.error('Failed to fetch admin business applications:', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, sortOrder, searchQuery])

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const url = `/api/admin/users?role=${userRoleFilter}&sort=${sortOrder}&search=${encodeURIComponent(searchQuery)}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success && data.users) {
        setUsers(data.users)
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err)
    } finally {
      setUsersLoading(false)
    }
  }, [userRoleFilter, sortOrder, searchQuery])

  useEffect(() => {
    if (activeModule === 'users') {
      const timer = setTimeout(() => {
        fetchUsers()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [activeModule, fetchUsers])

  const handleUpdateUserRole = async (id: string, newRole: 'admin' | 'merchant' | 'customer') => {
    setUpdatingUserId(id)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      })
      const data = await res.json()
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
        )
      } else {
        alert(data.error || 'Failed to update user role')
      }
    } catch (err) {
      console.error('Failed to update user role:', err)
    } finally {
      setUpdatingUserId(null)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusinesses()
    }, 200)
    return () => clearTimeout(timer)
  }, [fetchBusinesses])

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'pending', reason?: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, rejection_reason: reason }),
      })
      const data = await res.json()
      if (data.success) {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus, rejection_reason: reason || b.rejection_reason } : b))
        )
        if (selectedBusiness?.id === id) {
          setSelectedBusiness((prev: any) => (prev ? { ...prev, status: newStatus, rejection_reason: reason || prev?.rejection_reason } : null))
        }
        setRejectionModalBiz(null)
        setRejectionReasonInput('')
      } else {
        alert(data.error || 'Failed to update status')
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleOpenRejectModal = (biz: any) => {
    setRejectionModalBiz(biz)
    setRejectionReasonInput(biz.rejection_reason || 'Application does not meet platform criteria.')
  }

  const pendingCount = businesses.filter((b) => b.status === 'pending').length
  const approvedCount = businesses.filter((b) => b.status === 'approved').length
  const rejectedCount = businesses.filter((b) => b.status === 'rejected').length

  const modules = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, count: 0 },
    { id: 'applications', label: 'Applications', icon: Clock3, count: pendingCount },
    { id: 'businesses', label: 'All Businesses', icon: Building2, count: approvedCount },
    { id: 'users', label: 'Users & Roles', icon: Users, count: 0 },
    { id: 'settings', label: 'Settings', icon: ShieldCheck, count: 0 },
  ] as const

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Modular Left Sidebar Navigation Rail */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Sidebar Logo Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <Brand />
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase">
              Admin
            </span>
          </div>

          {/* Navigation Menu Modules */}
          <nav className="p-4 flex flex-col gap-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-2">
              Platform Modules
            </div>

            {modules.map((mod) => {
              const Icon = mod.icon
              const isActive = activeModule === mod.id
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{mod.label}</span>
                  </div>

                  {mod.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : mod.id === 'applications'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {mod.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                SA
              </div>
              <div className="flex flex-col text-left">
                <strong className="text-xs font-bold text-slate-900">Super Admin</strong>
                <span className="text-[10px] text-slate-500 truncate max-w-[110px]">admin@loyalty.local</span>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="p-2 rounded-xl hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Admin Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-900 font-bold capitalize">
              {modules.find((m) => m.id === activeModule)?.label}
            </strong>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Filter Search */}
            <div className="relative w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search platform..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button onClick={onSignOut} className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </header>

        {/* Module Content Renderer */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col gap-6 max-w-7xl w-full mx-auto">

          {activeModule === 'applications' ? (
            <>
              {/* Heading & KPI Cards */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Business Applications</h1>
                  <p className="text-slate-500 text-xs mt-1">Review incoming business registration requests and manage merchant access approvals.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl shadow-xs flex items-center gap-2 text-xs">
                    <Clock3 className="w-4 h-4 text-amber-500" />
                    <span><strong className="text-slate-900">{pendingCount}</strong> Pending</span>
                  </div>
                  <div className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl shadow-xs flex items-center gap-2 text-xs">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span><strong className="text-slate-900">{approvedCount}</strong> Approved</span>
                  </div>
                </div>
              </div>

              {/* Status Filter Toolbar */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar Mobile */}
                <div className="relative flex-1 sm:hidden">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search requests..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        statusFilter === tab
                          ? 'bg-white text-indigo-600 font-extrabold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab} {tab === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
                    </button>
                  ))}
                </div>

              </div>

              {/* Main Enterprise Data Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center text-slate-500 text-xs font-semibold">
                    Loading applications...
                  </div>
                ) : sortedBusinesses.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No business applications found matching filter criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          <SortableHeader label="Business / Legal Name" field="business_name" currentField={bizSortField} currentDir={bizSortDir} onSort={handleSortBiz} />
                          <SortableHeader label="Owner / Contact" field="owner_name" currentField={bizSortField} currentDir={bizSortDir} onSort={handleSortBiz} />
                          <SortableHeader label="Industry" field="industry" currentField={bizSortField} currentDir={bizSortDir} onSort={handleSortBiz} />
                          <SortableHeader label="Submitted Date" field="created_at" currentField={bizSortField} currentDir={bizSortDir} onSort={handleSortBiz} />
                          <SortableHeader label="Status" field="status" currentField={bizSortField} currentDir={bizSortDir} onSort={handleSortBiz} />
                          <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedBusinesses.map((biz) => (
                          <tr
                            key={biz.id}
                            onClick={() => setSelectedBusiness(biz)}
                            className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                          >
                            <td className="py-4 px-5">
                              <strong className="block text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {biz.business_name || biz.businessName}
                              </strong>
                              <span className="text-slate-400 text-[11px]">{biz.legal_name || biz.legalName || 'N/A'}</span>
                            </td>

                            <td className="py-4 px-5">
                              <strong className="block font-semibold text-slate-800">{biz.owner_name || biz.ownerName || 'N/A'}</strong>
                              <span className="text-slate-500 text-[11px]">{biz.email}</span>
                            </td>

                            <td className="py-4 px-5">
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                {biz.industry || 'General'}
                              </span>
                            </td>

                            <td className="py-4 px-5 text-slate-500">
                              {new Date(biz.created_at || Date.now()).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>

                            <td className="py-4 px-5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  biz.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : biz.status === 'rejected'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    biz.status === 'approved'
                                      ? 'bg-emerald-500'
                                      : biz.status === 'rejected'
                                      ? 'bg-red-500'
                                      : 'bg-amber-500 animate-pulse'
                                  }`}
                                />
                                {biz.status === 'approved'
                                  ? 'Approved'
                                  : biz.status === 'rejected'
                                  ? 'Rejected'
                                  : 'Pending'}
                              </span>
                            </td>

                            <td className="py-4 px-5 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedBusiness(biz)
                                }}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all cursor-pointer"
                              >
                                Review Request
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : activeModule === 'users' ? (
            <>
              {/* Heading & Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Users & Role Management</h1>
                  <p className="text-slate-500 text-xs mt-1">Manage platform user accounts, assign roles (Admin, Merchant, Customer), and view linked merchant stores.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl shadow-xs flex items-center gap-2 text-xs">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span><strong className="text-slate-900">{users.length}</strong> Accounts</span>
                  </div>
                </div>
              </div>

              {/* Toolbar: Role Filter Tabs */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
                  {(['all', 'admin', 'merchant', 'customer'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setUserRoleFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        userRoleFilter === tab
                          ? 'bg-white text-indigo-600 font-extrabold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Accounts Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                {usersLoading ? (
                  <div className="p-12 text-center text-slate-500 text-xs font-semibold">
                    Loading user directory...
                  </div>
                ) : sortedUsers.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No user accounts found matching criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          <SortableHeader label="User / Full Name" field="full_name" currentField={userSortField} currentDir={userSortDir} onSort={handleSortUser} />
                          <SortableHeader label="Contact Details" field="email" currentField={userSortField} currentDir={userSortDir} onSort={handleSortUser} />
                          <SortableHeader label="Assigned Role" field="role" currentField={userSortField} currentDir={userSortDir} onSort={handleSortUser} />
                          <SortableHeader label="Store Association" field="business_name" currentField={userSortField} currentDir={userSortDir} onSort={handleSortUser} />
                          <SortableHeader label="Created Date" field="created_at" currentField={userSortField} currentDir={userSortDir} onSort={handleSortUser} align="right" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedUsers.map((usr) => (
                          <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-xs">
                                  {(usr.full_name || usr.email || 'U').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <strong className="block text-sm font-bold text-slate-900">
                                    {usr.full_name || 'Anonymous User'}
                                  </strong>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              <strong className="block font-semibold text-slate-800">{usr.email}</strong>
                              <span className="text-slate-500 text-[11px]">{usr.phone || 'No phone set'}</span>
                            </td>

                            <td className="py-4 px-5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  usr.role === 'admin'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : usr.role === 'merchant'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {usr.role || 'customer'}
                              </span>
                            </td>

                            <td className="py-4 px-5 text-slate-700 font-semibold">
                              {usr.business_name ? (
                                <span className="inline-flex items-center gap-1 text-indigo-600">
                                  <Building2 className="w-3.5 h-3.5 inline-block" /> {usr.business_name}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal">None</span>
                              )}
                            </td>

                            <td className="py-4 px-5 text-right">
                              <strong className="block text-slate-900 font-bold">
                                {new Date(usr.created_at || Date.now()).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </strong>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {new Date(usr.created_at || Date.now()).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : activeModule === 'businesses' ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-900">All Registered Businesses</h2>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                Showing all {approvedCount} approved merchant stores operating on WalletPerks.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-900 capitalize">{activeModule} Module</h2>
              <p className="text-slate-500 text-xs mt-1">This enterprise module is configured and ready for expansion.</p>
            </div>
          )}

        </div>
      </main>

      {/* Slide-Over Application Detail Drawer */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end" onClick={() => setSelectedBusiness(null)}>
          <div
            className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 border-l border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Hero Header Banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 relative shadow-md shrink-0">
              <button
                onClick={() => setSelectedBusiness(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 pr-8">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center font-extrabold text-xl shadow-lg border border-white/20 shrink-0">
                  {(selectedBusiness.business_name || selectedBusiness.businessName || 'ST').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                    Application Inspector
                  </span>
                  <h2 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                    {selectedBusiness.business_name || selectedBusiness.businessName}
                  </h2>
                  <span className="text-xs text-indigo-200/80 block mt-0.5 font-medium">
                    {selectedBusiness.legal_name || selectedBusiness.legalName || 'Registered Entity'}
                  </span>
                </div>
              </div>

              {/* Status Ribbon Pill */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-indigo-200/80 font-medium">Current Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm ${
                    selectedBusiness.status === 'approved'
                      ? 'bg-emerald-500 text-white'
                      : selectedBusiness.status === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-400 text-slate-900 font-extrabold'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {selectedBusiness.status === 'approved'
                    ? 'Approved Partner'
                    : selectedBusiness.status === 'rejected'
                    ? 'Application Rejected'
                    : 'Pending Admin Review'}
                </span>
              </div>
            </div>

            {/* Drawer Scrollable Body Content */}
            <div className="p-6 sm:p-7 flex-1 flex flex-col gap-5 text-xs">
              
              {/* Rejection Alert Box if Status is Rejected */}
              {selectedBusiness.status === 'rejected' && selectedBusiness.rejection_reason && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200/80 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-red-700 font-extrabold text-xs">
                    <X className="w-4 h-4 text-red-600" />
                    <span>Official Rejection Notice</span>
                  </div>
                  <p className="text-red-900 font-medium leading-relaxed pl-6">
                    &quot;{selectedBusiness.rejection_reason}&quot;
                  </p>
                </div>
              )}

              {/* Business Contact & Identity Card */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-3.5 shadow-xs">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200/60 pb-2">
                  Owner & Primary Contact
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Owner Name</span>
                    <strong className="text-slate-900 font-bold block text-xs mt-0.5">
                      {selectedBusiness.owner_name || selectedBusiness.ownerName || 'N/A'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Industry</span>
                    <strong className="text-slate-900 font-bold block text-xs mt-0.5">
                      {selectedBusiness.industry || 'General Merchant'}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Email Address:</span>
                    <strong className="text-indigo-600 font-bold font-mono">{selectedBusiness.email}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Phone Number:</span>
                    <strong className="text-slate-800 font-semibold">{selectedBusiness.phone || 'Not provided'}</strong>
                  </div>

                  {selectedBusiness.website && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Store Website:</span>
                      <a
                        href={selectedBusiness.website.startsWith('http') ? selectedBusiness.website : `https://${selectedBusiness.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline font-bold"
                      >
                        {selectedBusiness.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Store Address & Geocode Card */}
              {selectedBusiness.address && (
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200/60 pb-2 flex items-center justify-between">
                    <span>Store Location & Address</span>
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  </div>

                  <p className="text-slate-800 font-semibold leading-relaxed text-xs">
                    {selectedBusiness.address}
                  </p>

                  {(selectedBusiness.latitude || selectedBusiness.longitude) && (
                    <div className="px-3 py-2 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-700 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-indigo-500 font-medium">Map Geocode:</span>
                      <span className="font-mono font-bold">{selectedBusiness.latitude}, {selectedBusiness.longitude}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description / Business Notes Card */}
              {selectedBusiness.description && (
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-2 shadow-xs">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200/60 pb-2">
                    Store Bio & Description
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {selectedBusiness.description}
                  </p>
                </div>
              )}

              {/* Submission Date Metadata */}
              <div className="text-[11px] text-slate-400 text-center pt-2">
                Application submitted on {new Date(selectedBusiness.created_at || Date.now()).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>

            </div>

            {/* Sticky Action Controls Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50/90 backdrop-blur-xs flex flex-col gap-3 sticky bottom-0 shadow-xl shrink-0">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>Application Decision Controls</span>
                <span className="text-slate-400 font-mono">Action Required</span>
              </div>

              <div className="flex items-center gap-3">
                {selectedBusiness.status !== 'approved' && (
                  <button
                    disabled={updatingId === selectedBusiness.id}
                    onClick={() => handleUpdateStatus(selectedBusiness.id, 'approved')}
                    className="flex-1 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30 disabled:opacity-50"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                    <span>Approve Partner</span>
                  </button>
                )}

                {selectedBusiness.status !== 'rejected' && (
                  <button
                    disabled={updatingId === selectedBusiness.id}
                    onClick={() => handleOpenRejectModal(selectedBusiness)}
                    className="flex-1 bg-gradient-to-r from-rose-600 via-red-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-400/30 disabled:opacity-50"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                    <span>Reject Application</span>
                  </button>
                )}
              </div>

              {selectedBusiness.status !== 'pending' && (
                <button
                  disabled={updatingId === selectedBusiness.id}
                  onClick={() => handleUpdateStatus(selectedBusiness.id, 'pending')}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Application Status to Pending Review</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Rejection Reason Prompt Modal */}
      {rejectionModalBiz && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setRejectionModalBiz(null)}>
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 block mb-0.5">
                  Confirm Application Rejection
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Reject {rejectionModalBiz.business_name || rejectionModalBiz.businessName}?
                </h3>
              </div>
              <button onClick={() => setRejectionModalBiz(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Please specify the reason for rejection. This notice will be recorded in the database and displayed to the merchant applicant when checking status.
            </p>

            <div className="mb-4">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Quick Reason Presets:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Incomplete business documentation',
                  'Invalid store address / location details',
                  'Unsupported industry category',
                  'Duplicate business registration',
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setRejectionReasonInput(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Detailed Rejection Reason:
              </label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                rows={4}
                placeholder="Enter detailed reason for rejection..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={() => setRejectionModalBiz(null)} className="text-xs py-2">
                Cancel
              </Button>
              <Button
                disabled={updatingId === rejectionModalBiz.id || !rejectionReasonInput.trim()}
                onClick={() => handleUpdateStatus(rejectionModalBiz.id, 'rejected', rejectionReasonInput)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Confirm & Reject Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BusinessDashboard({ registration, onSignOut }: { registration: Registration; onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Rewards' | 'Customers' | 'Transactions' | 'Campaigns' | 'Settings'>('Overview')
  const [createRewardModal, setCreateRewardModal] = useState(false)
  const [rewardNameInput, setRewardNameInput] = useState('')
  const [rewardPointsInput, setRewardPointsInput] = useState('100')
  const [rewardsList, setRewardsList] = useState([
    { id: '1', name: 'Free Artisanal Coffee', points: 100, redeemed: 482, status: 'Active' },
    { id: '2', name: '20% Off Any Pastry', points: 150, redeemed: 215, status: 'Active' },
    { id: '3', name: '$10 Store Voucher', points: 300, redeemed: 94, status: 'Active' },
  ])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rewardNameInput.trim()) return

    const newReward = {
      id: String(Date.now()),
      name: rewardNameInput,
      points: Number(rewardPointsInput) || 100,
      redeemed: 0,
      status: 'Active',
    }

    setRewardsList([newReward, ...rewardsList])
    setCreateRewardModal(false)
    setRewardNameInput('')
    setRewardPointsInput('100')

    setToastMessage(`Reward "${newReward.name}" successfully published to customer app!`)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const navItems = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'Rewards', label: 'Loyalty Rewards', icon: Gift },
    { id: 'Customers', label: 'Customers', icon: Users },
    { id: 'Transactions', label: 'Transactions', icon: RefreshCw },
    { id: 'Campaigns', label: 'Campaigns', icon: Compass },
    { id: 'Settings', label: 'Store Settings', icon: ShieldCheck },
  ] as const

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Merchant Sidebar Navigation Rail */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <Brand />
          </div>

          {/* Nav Items */}
          <nav className="p-4 flex flex-col gap-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-2">
              Merchant Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Merchant User Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                {(registration.businessName || 'WP').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <strong className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                  {registration.businessName || 'Merchant Store'}
                </strong>
                <span className="text-[10px] text-slate-500 truncate max-w-[110px]">
                  {registration.ownerName || 'Verified Owner'}
                </span>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="p-2 rounded-xl hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Merchant Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-900 font-bold">{activeTab}</strong>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Store Verified
            </span>

            <Button
              onClick={() => setCreateRewardModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 mr-1.5 inline-block" /> Create Reward
            </Button>

            <button
              onClick={onSignOut}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col gap-6 max-w-7xl w-full mx-auto">
          
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <div>
              <span className="text-indigo-300 text-xs uppercase font-extrabold tracking-wider block mb-1">
                Merchant Workspace
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {registration.ownerName?.split(' ')[0] || 'Merchant'}!
              </h1>
              <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                Here is a real-time overview of your customer engagement, issued loyalty points, and active store rewards.
              </p>
            </div>

            <Button
              onClick={() => setCreateRewardModal(true)}
              className="bg-white hover:bg-slate-100 text-indigo-900 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all cursor-pointer shrink-0"
            >
              + Add New Perk
            </Button>
          </div>

          {/* KPI Stat Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <small className="text-[10px] uppercase font-extrabold text-slate-400">Total Customers</small>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <strong className="block text-2xl font-extrabold text-slate-900 mt-2">2,847</strong>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">+12.5% this month</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <small className="text-[10px] uppercase font-extrabold text-slate-400">Points Issued</small>
                <Gift className="w-4 h-4 text-amber-500" />
              </div>
              <strong className="block text-2xl font-extrabold text-slate-900 mt-2">128,420</strong>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">+8.2% this week</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <small className="text-[10px] uppercase font-extrabold text-slate-400">Rewards Redeemed</small>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
              <strong className="block text-2xl font-extrabold text-slate-900 mt-2">1,284</strong>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">+4.6% this week</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <small className="text-[10px] uppercase font-extrabold text-slate-400">Engagement Rate</small>
                <Compass className="w-4 h-4 text-indigo-500" />
              </div>
              <strong className="block text-2xl font-extrabold text-slate-900 mt-2">68.4%</strong>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">+2.4% return rate</span>
            </div>
          </div>

          {/* Main Grid: Rewards Management & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Rewards List Panel (Left 2 cols) */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Active Store Rewards</h2>
                  <p className="text-xs text-slate-500">Perks available for customers to discover and redeem.</p>
                </div>

                <Button
                  onClick={() => setCreateRewardModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer"
                >
                  + Add Reward
                </Button>
              </div>

              <div className="divide-y divide-slate-100">
                {rewardsList.map((reward) => (
                  <div key={reward.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-sm font-bold text-slate-900">{reward.name}</strong>
                        <span className="text-xs text-slate-500">{reward.points} Points required · {reward.redeemed} Redeemed</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase">
                        {reward.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel (Right 1 col) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Quick Store Actions</h2>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setCreateRewardModal(true)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-slate-900 group-hover:text-indigo-600">Create a Reward</strong>
                      <small className="text-slate-500 text-[11px]">Publish a new loyalty perk</small>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </button>

                <button
                  onClick={() => setActiveTab('Customers')}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-slate-900 group-hover:text-indigo-600">View Customers</strong>
                      <small className="text-slate-500 text-[11px]">See your top loyal regulars</small>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </button>

                <button
                  onClick={() => setActiveTab('Campaigns')}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-slate-900 group-hover:text-indigo-600">Launch Campaign</strong>
                      <small className="text-slate-500 text-[11px]">Send promotional perk alert</small>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Create Reward Pop-over Modal */}
      {createRewardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setCreateRewardModal(false)}>
          <form
            onSubmit={handleCreateReward}
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Create New Loyalty Reward</h3>
              </div>
              <button type="button" onClick={() => setCreateRewardModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs mb-6">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Reward Title
                </label>
                <input
                  required
                  value={rewardNameInput}
                  onChange={(e) => setRewardNameInput(e.target.value)}
                  placeholder="e.g. Free Coffee after 10 visits"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Points Required
                </label>
                <input
                  type="number"
                  required
                  value={rewardPointsInput}
                  onChange={(e) => setRewardPointsInput(e.target.value)}
                  placeholder="100"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Button variant="outline" type="button" onClick={() => setCreateRewardModal(false)} className="text-xs py-2">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Publish Reward
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export function RewardsPlatform({ initialScreen = 'landing' }: { initialScreen?: Screen }) {
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const KNOWN_PATHS = ['/', '/home', '/login', '/register-business', '/register', '/merchant-dashboard', '/dashboard', '/business-status', '/status', '/merchant', '/pending-review', '/rejected', '/admin']
      if (path === '/admin') return 'admin'
      if (path === '/register-business' || path === '/register') return 'register'
      if (path === '/login') return 'login'
      if (path === '/merchant-dashboard' || path === '/dashboard') return 'business'
      if (path === '/business-status' || path === '/status' || path === '/merchant' || path === '/pending-review' || path === '/rejected') return 'pending'
      if (!KNOWN_PATHS.includes(path)) return 'notFound'
    }
    return initialScreen
  })

  const [registration, setRegistration] = useState<Registration>(initialRegistration)
  const hasCheckedStatusRef = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const storedUser = localStorage.getItem('walletperks_active_user')

      const handlePopState = () => {
        const currentPath = window.location.pathname
        const user = localStorage.getItem('walletperks_active_user')

        if (currentPath === '/admin') setScreen('admin')
        else if (currentPath === '/register-business' || currentPath === '/register') setScreen('register')
        else if (currentPath === '/login') {
          if (user) handleCheckUserStatus(user)
          else setScreen('login')
        }
        else if (currentPath === '/merchant-dashboard' || currentPath === '/dashboard') setScreen('business')
        else if (currentPath === '/business-status' || currentPath === '/status' || currentPath === '/merchant') setScreen('pending')
        else if (currentPath === '/' || currentPath === '/home') setScreen('landing')
      }

      window.addEventListener('popstate', handlePopState)

      // Restore session once on refresh if user is on any app route
      if (!hasCheckedStatusRef.current && storedUser && (path === '/merchant-dashboard' || path === '/dashboard' || path === '/business-status' || path === '/merchant' || path === '/status' || path === '/admin' || path === '/login')) {
        hasCheckedStatusRef.current = true
        handleCheckUserStatus(storedUser)
      }

      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const navigateTo = (newScreen: Screen, urlPath?: string) => {
    setScreen(newScreen)
    if (typeof window !== 'undefined' && urlPath && window.location.pathname !== urlPath) {
      window.history.pushState(null, '', urlPath)
    }
  }

  function signOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletperks_active_user')
    }
    navigateTo('landing', '/')
  }

  const handleCheckUserStatus = async (userEmail: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletperks_active_user', userEmail)
    }

    try {
      const res = await fetch(`/api/business/status?email=${encodeURIComponent(userEmail)}`)
      const data = await res.json()

      // If user is an Admin, route to /admin panel
      if (data.isAdmin || data.role === 'admin' || userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        navigateTo('admin', '/admin')
        return
      }

      if (data.hasBusiness && data.business) {
        setRegistration({
          businessName: data.business.businessName || '',
          legalName: data.business.legalName || '',
          ownerName: data.business.ownerName || '',
          email: data.business.email || userEmail,
          phone: data.business.phone || '',
          industry: data.business.industry || '',
          website: data.business.website || '',
          address: data.business.address || '',
          description: data.business.description || '',
          rejectionReason: data.business.rejectionReason || '',
        })

        if (data.status === 'approved') {
          navigateTo('business', '/merchant-dashboard')
        } else if (data.status === 'rejected') {
          navigateTo('rejected', '/business-status')
        } else {
          navigateTo('pending', '/business-status')
        }
      } else {
        navigateTo('pending', '/business-status')
      }
    } catch (e) {
      console.error('Failed to check business status:', e)
      if (userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        navigateTo('admin', '/admin')
      } else {
        navigateTo('pending', '/business-status')
      }
    }
  }

  return screen === 'landing' ? (
    <Landing 
      onRegister={() => navigateTo('register', '/register-business')} 
      onLogin={() => {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('walletperks_active_user') : null
        if (storedUser) {
          handleCheckUserStatus(storedUser)
        } else {
          navigateTo('login', '/login')
        }
      }} 
    />
  ) : screen === 'register' ? (
    <Register 
      onBack={() => navigateTo('landing', '/')} 
      onSubmit={(data) => {
        setRegistration(data)
        handleCheckUserStatus(data.email)
      }} 
    />
  ) : screen === 'login' ? (
    <Login 
      onBack={() => navigateTo('landing', '/')} 
      onLogin={(email) => handleCheckUserStatus(email)} 
    />
  ) : screen === 'pending' ? (
    <Pending
      registration={registration}
      onSignOut={signOut}
      onRefreshStatus={async () => {
        if (registration.email) {
          await handleCheckUserStatus(registration.email)
        }
      }}
    />
  ) : screen === 'rejected' ? (
    <RejectedStatus registration={registration} onSignOut={signOut} />
  ) : screen === 'notFound' ? (
    <NotFoundScreen onGoHome={() => navigateTo('landing', '/')} />
  ) : screen === 'admin' ? (
    <AdminPanel onSignOut={signOut} />
  ) : (
    <BusinessDashboard registration={registration} onSignOut={signOut} />
  )
}
