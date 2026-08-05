'use client'

import { FormEvent, useState, useEffect } from 'react'
import {
  ArrowRight, Bell, Building2, Check, ChevronRight, CircleHelp, Clock3, Eye, EyeOff, Gift,
  LayoutDashboard, LogOut, Menu, MoreHorizontal, Search, ShieldCheck, Sparkles, Users, X,
  Star, Zap, Smartphone, TrendingUp, HelpCircle, BarChart3, QrCode, Heart, Award, CheckCircle2, ChevronDown, Flame, DollarSign, Coffee, ShoppingBag, Dumbbell, Scissors, Utensils
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type Screen = 'landing' | 'register' | 'login' | 'pending' | 'admin' | 'business'
type Registration = { businessName: string; legalName: string; ownerName: string; email: string; phone: string; industry: string; website: string; address: string; description: string }
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
  const [customersCount, setCustomersCount] = useState(1200)
  const [avgTicket, setAvgTicket] = useState(25)
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

  // ROI calculations
  const extraVisitsPerMonth = Math.round(customersCount * 0.32)
  const addedMonthlyRevenue = extraVisitsPerMonth * avgTicket
  const annualRevBoost = addedMonthlyRevenue * 12

  const faqs = [
    {
      q: "How does Loyalty work for my customers?",
      a: "Customers simply scan a QR code at your register or tap an NFC card to save your digital loyalty pass directly into Apple Wallet or Google Pay. Zero app downloads required!"
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
          <a href="#demo">Live Demo</a>
          <a href="#roi">ROI Calculator</a>
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
          <div className="hero-badge">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Next-Gen Customer Retention Platform</span>
            <span className="badge-pill">2026 Ready</span>
          </div>

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
            <div className="trust-item"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span>Apple & Google Wallet</span></div>
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
            <h3>Apple & Google Digital Wallet Cards</h3>
            <p>Zero friction for customers. Cards live inside Apple Wallet and Google Pay with real-time balance updates and proximity notifications when they pass your store.</p>
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

      {/* Interactive ROI Calculator Section */}
      <section id="roi" className="roi-section">
        <div className="roi-card-wrap">
          <div className="roi-copy">
            <div className="eyebrow-tag">REVENUE CALCULATOR</div>
            <h2>See how much extra revenue loyalty brings</h2>
            <p>Increasing customer retention by just 5% can boost overall profits by up to 25% to 95%.</p>
            
            <div className="slider-group">
              <div className="slider-header">
                <span>Active Monthly Customers</span>
                <strong>{customersCount.toLocaleString()} customers</strong>
              </div>
              <input 
                type="range" 
                min="200" 
                max="5000" 
                step="100" 
                value={customersCount}
                onChange={(e) => setCustomersCount(Number(e.target.value))}
                className="roi-slider"
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>Average Order Value ($)</span>
                <strong>${avgTicket}</strong>
              </div>
              <input 
                type="range" 
                min="5" 
                max="100" 
                step="5" 
                value={avgTicket}
                onChange={(e) => setAvgTicket(Number(e.target.value))}
                className="roi-slider"
              />
            </div>
          </div>

          <div className="roi-result-card">
            <small>ESTIMATED ADDITIONAL MONTHLY REVENUE</small>
            <strong className="roi-amount">+${addedMonthlyRevenue.toLocaleString()}</strong>
            <small className="roi-sub">+${annualRevBoost.toLocaleString()} / year projected boost</small>

            <div className="roi-metrics-grid">
              <div>
                <span>+32%</span>
                <small>Repeat Visits</small>
              </div>
              <div>
                <span>{extraVisitsPerMonth}</span>
                <small>Extra Orders / Mo</small>
              </div>
              <div>
                <span>14x</span>
                <small>Estimated ROI</small>
              </div>
            </div>

            <Button onClick={onRegister} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
              Claim Your Free Trial <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
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
            <p>&ldquo;The Apple Wallet card feature is a hit. Customers love tapping their phone at checkout, and our re-engagement campaign brought back 80+ lost customers.&rdquo;</p>
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
            <a href="#features">Smart Re-engagement</a>
            <a href="#roi">Revenue Calculator</a>
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

  function submit(event: FormEvent) {
    event.preventDefault()
    if (password.length < 8) return setError('Please use a password with at least 8 characters.')
    if (!consent) return setError('Please accept the terms to submit your application.')
    setError('')
    onSubmit(form)
  }

  const industryOptions = [
    { label: 'Coffee & Cafe', icon: Coffee },
    { label: 'Retail & Boutique', icon: ShoppingBag },
    { label: 'Fitness & Studio', icon: Dumbbell },
    { label: 'Salon & Spa', icon: Scissors },
    { label: 'Restaurant & Bar', icon: Utensils },
  ]

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
                <strong>Apple & Google Wallet</strong>
                <small>Passes saved directly on customer smartphones.</small>
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
                    const Icon = opt.icon
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
                <div className="field-group">
                  <label>Store Address <b>*</b></label>
                  <input 
                    name="address" 
                    value={form.address} 
                    onChange={(e) => update('address', e.target.value)} 
                    placeholder="123 Main Street, Austin, TX" 
                    required 
                  />
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
                <Button type="submit" className="btn-continue highlight">
                  Submit Application for Review <CheckCircle2 className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          )}
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

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email || !password) {
      return setError('Please enter your business email and password.')
    }
    setError('')
    onLogin(email)
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
                <strong>Mobile Wallet Ready</strong>
                <small>Apple & Google Wallet passes active</small>
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

          <div className="login-demo-box">
            <div className="demo-box-head">
              <CircleHelp className="w-4 h-4 text-purple-300" />
              <strong>Quick Prototype Access</strong>
            </div>
            <p>Click below to prefill demo login credentials:</p>
            <div className="demo-btns-row">
              <button type="button" onClick={() => handleDemoFill(ADMIN_EMAIL)}>
                Super Admin ({ADMIN_EMAIL})
              </button>
              <button type="button" onClick={() => handleDemoFill('owner@northstarcoffee.com')}>
                Merchant Demo
              </button>
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

            <Button type="submit" className="btn-continue highlight w-full justify-center">
              Sign in to Workspace <ArrowRight className="w-4 h-4 ml-1.5" />
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

function Pending({ registration, onSignOut }: { registration: Registration; onSignOut: () => void }) { return <main className="status-page"><div className="status-brand"><Brand /><button className="signout-link" onClick={onSignOut}><LogOut /> Sign out</button></div><section className="status-card"><div className="status-icon pending"><Clock3 /></div><div className="eyebrow">Application received</div><h1>We&apos;re reviewing your business</h1><p>Thanks for applying, {registration.ownerName || 'there'}. Our team reviews every business personally, then unlocks the workspace when everything looks right.</p><div className="review-timeline"><div className="done"><span><Check /></span><strong>Application submitted</strong><small>Your information is safely with our team.</small></div><div className="current"><span><Clock3 /></span><strong>Team review</strong><small>Usually completed within one business day.</small></div><div><span>3</span><strong>Workspace access</strong><small>We&apos;ll let you know when it&apos;s ready.</small></div></div><div className="status-summary"><div><small>Business</small><strong>{registration.businessName || 'Your business'}</strong></div><div><small>Application status</small><strong><span className="status-dot" /> Pending review</strong></div><div><small>Submitted contact</small><strong>{registration.email || 'your email'}</strong></div></div></section></main> }

function AdminPanel({ onSignOut, onApprove }: { onSignOut: () => void; onApprove: () => void }) { const [approved, setApproved] = useState(false); const [active, setActive] = useState('Business applications'); const [query, setQuery] = useState(''); return <main className="admin-page"><header className="admin-top"><Brand /><div className="admin-user"><span className="top-avatar">SA</span><span><strong>Super Admin</strong><small>Configured admin account</small></span><button onClick={onSignOut} aria-label="Sign out"><LogOut /></button></div></header><div className="admin-layout"><aside className="admin-rail"><div className="eyebrow">Platform operations</div>{['Overview', 'Business applications', 'All businesses', 'Support'].map((item, index) => <button className={active === item ? 'active' : ''} onClick={() => setActive(item)} key={item}>{index === 0 ? <LayoutDashboard /> : index === 1 ? <Clock3 /> : index === 2 ? <Building2 /> : <CircleHelp />}{item}{index === 1 && <b>3</b>}</button>)}</aside><section className="admin-content"><div className="admin-heading"><div><div className="eyebrow">Review queue / {active}</div><h1>{active}</h1><p>Keep the platform trusted by reviewing businesses before they access loyalty.</p></div><div className="admin-kpi"><Clock3 /><span><strong>{approved ? '2' : '3'}</strong><small>Pending review</small></span></div></div>{active === 'Business applications' ? <><div className="review-banner"><ShieldCheck /><span><strong>Approval is the access gate</strong><small>Only approved businesses can enter their loyalty workspace.</small></span></div><div className="review-toolbar"><div className="table-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications" /></div><button className="filter-button">All statuses <ChevronRight /></button></div><div className="review-card"><div className="review-card-top"><div><span className={approved ? 'status-pill approved-pill' : 'status-pill pending-pill'}>{approved ? 'Approved' : 'Pending review'}</span><h2>{approved ? 'Morrow Goods' : 'Northstar Coffee'}</h2><p>{approved ? 'hello@morrowgoods.co' : 'coffee@northstar.co'} · Submitted today</p></div><button className="icon-button" aria-label="More application actions"><MoreHorizontal /></button></div><div className="review-details"><div><small>Owner</small><strong>{approved ? 'Maya Chen' : 'Jordan Davis'}</strong></div><div><small>Industry</small><strong>{approved ? 'Retail & goods' : 'Coffee & food'}</strong></div><div><small>Location</small><strong>Portland, OR</strong></div><div><small>Website</small><strong>northstar.co</strong></div></div><div className="review-description"><small>Business description</small><p>A neighborhood coffee shop focused on thoughtful service, seasonal drinks, and community.</p></div>{!approved ? <div className="review-actions"><Button variant="outline" onClick={() => setApproved(true)}>Request changes</Button><Button onClick={() => { setApproved(true); onApprove() }}><Check data-icon="inline-start" /> Approve business</Button></div> : <div className="success-note"><Check /><span><strong>Business approved</strong><small>Workspace access is now available for the business owner.</small></span></div>}</div></> : <div className="empty-admin"><ShieldCheck /><h2>{active} is ready</h2><p>This prototype keeps the review queue focused. Select Business applications to review the current request.</p></div>}</section></div></main> }

function BusinessDashboard({ registration, onSignOut }: { registration: Registration; onSignOut: () => void }) { const [active, setActive] = useState('Overview'); const [mobileNav, setMobileNav] = useState(false); const [notifications, setNotifications] = useState(false); const [modal, setModal] = useState(false); const [created, setCreated] = useState(false); const nav = ['Overview', 'Rewards', 'Customers', 'Transactions', 'Campaigns']; return <main className="approved-page"><header className="approved-top"><button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Open navigation"><Menu /></button><Brand /><div className="approved-user"><button className="notification-button icon-button" onClick={() => setNotifications(!notifications)} aria-label="Notifications"><Bell /><i /></button><span className="top-avatar">{(registration.businessName || 'NC').slice(0, 2).toUpperCase()}</span><span><strong>{registration.businessName || 'Northstar Coffee'}</strong><small>Approved business</small></span><button onClick={onSignOut} aria-label="Sign out"><LogOut /></button></div>{notifications && <div className="notification-popover"><div><strong>Notifications</strong><button className="icon-button" onClick={() => setNotifications(false)} aria-label="Close notifications"><X /></button></div><p><span className="dot" /> Your application was approved.</p><p><span className="dot orange" /> 24 customers earned points today.</p></div>}</header><div className="approved-layout"><aside className={`approved-rail ${mobileNav ? 'open' : ''}`}><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X /></button><div className="eyebrow">Your workspace</div>{nav.map((item, index) => <button className={active === item ? 'active' : ''} onClick={() => { setActive(item); setMobileNav(false) }} key={item}>{index === 0 ? <LayoutDashboard /> : index === 1 ? <Gift /> : index === 2 ? <Users /> : <ShieldCheck />}{item}</button>)}<div className="rail-bottom"><button><CircleHelp /> Help center</button></div></aside><section className="approved-content"><div className="approved-heading"><div><div className="eyebrow">Tuesday, January 31, 2024 / {active}</div><h1>{active === 'Overview' ? `Good morning, ${registration.ownerName?.split(' ')[0] || 'there'}` : active}</h1><p>{active === 'Overview' ? "Here's what's happening with your loyalty program." : `Manage your ${active.toLowerCase()} in one focused workspace.`}</p></div><Button onClick={() => setModal(true)}><Gift data-icon="inline-start" /> Create reward</Button></div>{active === 'Overview' ? <><div className="dashboard-metrics"><div><small>Total customers</small><strong>2,847</strong><b>+12.5%</b></div><div><small>Points issued</small><strong>128,420</strong><b>+8.2%</b></div><div><small>Rewards redeemed</small><strong>1,284</strong><b>+4.6%</b></div><div><small>Engagement rate</small><strong>68.4%</strong><b>+2.4%</b></div></div><div className="approved-grid"><div className="approved-panel chart-fake"><div><h2>Points activity</h2><small>Points issued and redeemed over time</small></div><div className="fake-chart"><span /><span /><span /><span /><span /></div><div className="chart-labels"><small>Jan 1</small><small>Jan 8</small><small>Jan 15</small><small>Jan 22</small><small>Jan 31</small></div></div><div className="approved-panel quick-list"><h2>Quick actions</h2><button onClick={() => setModal(true)}><span className="quick-icon"><Gift /></span><span><strong>Create a reward</strong><small>Give customers a reason to return</small></span><ChevronRight /></button><button onClick={() => setActive('Customers')}><span className="quick-icon"><Users /></span><span><strong>View customers</strong><small>See your most loyal regulars</small></span><ChevronRight /></button><button onClick={() => setActive('Campaigns')}><span className="quick-icon"><ShieldCheck /></span><span><strong>Start a campaign</strong><small>Reach customers with a message</small></span><ChevronRight /></button></div></div></> : <div className="empty-dashboard"><div className="empty-icon"><LayoutDashboard /></div><h2>{active} is ready for your business</h2><p>This focused workspace will help you manage {active.toLowerCase()} as your loyalty program grows.</p><Button onClick={() => setActive('Overview')}>Back to overview <ArrowRight data-icon="inline-end" /></Button></div>}</section></div>{modal && <div className="modal-backdrop" role="presentation"><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="reward-title"><button className="icon-button modal-close" onClick={() => setModal(false)} aria-label="Close dialog"><X /></button><div className="modal-symbol"><Gift /></div><h2 id="reward-title">Create a new reward</h2><p>Set up a simple reward customers can discover and redeem.</p><label className="auth-field"><span>Reward name</span><input placeholder="Free coffee after 10 visits" /></label><label className="auth-field"><span>Points required</span><input type="number" placeholder="100" /></label><div className="modal-actions"><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={() => { setModal(false); setCreated(true) }}>Create reward</Button></div></div></div>}{created && <div className="toast"><Check /><span><strong>Reward created</strong><small>Your new reward is ready to share.</small></span><button onClick={() => setCreated(false)} aria-label="Dismiss notification"><X /></button></div>}</main> }

export function RewardsPlatform({ initialScreen = 'landing' }: { initialScreen?: Screen }) {
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      if (path === '/register-business' || path === '/register') return 'register'
      if (path === '/login') return 'login'
    }
    return initialScreen
  })

  const [registration, setRegistration] = useState<Registration>(initialRegistration)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        const path = window.location.pathname
        if (path === '/register-business' || path === '/register') setScreen('register')
        else if (path === '/login') setScreen('login')
        else if (path === '/') setScreen('landing')
      }
      window.addEventListener('popstate', handlePopState)
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
    navigateTo('landing', '/')
  }

  return screen === 'landing' ? (
    <Landing 
      onRegister={() => navigateTo('register', '/register-business')} 
      onLogin={() => navigateTo('login', '/login')} 
    />
  ) : screen === 'register' ? (
    <Register 
      onBack={() => navigateTo('landing', '/')} 
      onSubmit={(data) => { setRegistration(data); setScreen('pending') }} 
    />
  ) : screen === 'login' ? (
    <Login 
      onBack={() => navigateTo('landing', '/')} 
      onLogin={(email) => setScreen(email.toLowerCase() === ADMIN_EMAIL ? 'admin' : registration.businessName ? 'business' : 'pending')} 
    />
  ) : screen === 'pending' ? (
    <Pending registration={registration} onSignOut={signOut} />
  ) : screen === 'admin' ? (
    <AdminPanel onSignOut={signOut} onApprove={() => undefined} />
  ) : (
    <BusinessDashboard registration={registration} onSignOut={signOut} />
  )
}

