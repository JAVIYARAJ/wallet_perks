/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 * API Reference: https://developers.brevo.com/reference/sendtransacemail
 */

interface SendEmailParams {
  toEmail: string
  toName: string
  subject: string
  htmlContent: string
}

export async function sendEmailWithBrevo({ toEmail, toName, subject, htmlContent }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'javiyaraj4@gmail.com'
  const senderName = process.env.BREVO_SENDER_NAME || 'WalletPerks Support'
  const replyToEmail = 'supportwalletperks@gmail.com'

  if (!apiKey) {
    console.log(`[Brevo Email Service - Simulation Mode] Email to ${toEmail} (${toName}) with subject: "${subject}"`)
    return { success: true, simulated: true }
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        replyTo: { name: 'WalletPerks Support', email: replyToEmail },
        to: [{ email: toEmail, name: toName }],
        subject,
        htmlContent,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('Brevo API Error:', data)
      return { success: false, error: data }
    }

    return { success: true, messageId: data.messageId }
  } catch (err: any) {
    console.error('Failed to send email via Brevo:', err)
    return { success: false, error: err.message }
  }
}

/**
 * HTML Email Template for Merchant Registration (Under Review)
 */
export function buildMerchantRegistrationEmailHtml(params: {
  ownerName: string
  businessName: string
  legalName?: string
  industry: string
  address: string
  email: string
  phone?: string
  gstin?: string
  pan?: string
}) {
  const { ownerName, businessName, legalName, industry, address, email, phone, gstin, pan } = params

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - WalletPerks</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:24px; border:1px solid #e2e8f0; overflow:hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #312e81 0%, #4338ca 50%, #0f172a 100%); padding: 36px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display:inline-block; background-color:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); border-radius:12px; padding:6px 14px; color:#e0e7ff; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">
                      Merchant Registration
                    </div>
                    <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; tracking-tight: -0.5px;">
                      Application Under Review ⏳
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size:15px; line-height:1.6; color:#334155; margin-top:0;">
                Hello <strong>${ownerName}</strong>,
              </p>
              <p style="font-size:14px; line-height:1.6; color:#475569;">
                Thank you for registering <strong>${businessName}</strong> with <strong>WalletPerks</strong>! Your business application has been submitted and is currently being reviewed by our verification team.
              </p>

              <!-- Status Notice Box -->
              <div style="background-color:#fffbeb; border:1px solid #fef3c7; border-radius:16px; padding:20px; margin:24px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="32" valign="top">
                      <span style="font-size:20px;">📋</span>
                    </td>
                    <td>
                      <strong style="color:#b45309; font-size:13px; display:block; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px;">Next Step: Verification</strong>
                      <span style="color:#92400e; font-size:13px; line-height:1.5; display:block;">
                        Our compliance team typically reviews requests within 24 to 48 hours. Once approved, you will get access to your Merchant Dashboard to create loyalty cards and rewards!
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Submitted Business Information Summary Table -->
              <h3 style="font-size:14px; font-weight:800; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px; margin-top:28px;">
                Submitted Business Profile
              </h3>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
                <tr style="background-color:#f8fafc;">
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:12px; color:#64748b; font-weight:600;" width="40%">Store / Business Name:</td>
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:13px; color:#0f172a; font-weight:700;">${businessName}</td>
                </tr>
                ${legalName ? `
                <tr>
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:12px; color:#64748b; font-weight:600;">Legal Entity Name:</td>
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:13px; color:#0f172a; font-weight:600;">${legalName}</td>
                </tr>
                ` : ''}
                ${gstin ? `
                <tr style="background-color:#f8fafc;">
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:12px; color:#64748b; font-weight:600;">GSTIN Number:</td>
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:13px; color:#0f172a; font-weight:700; font-family:monospace;">${gstin}</td>
                </tr>
                ` : ''}
                ${pan ? `
                <tr>
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:12px; color:#64748b; font-weight:600;">PAN Card Number:</td>
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:13px; color:#0f172a; font-weight:700; font-family:monospace;">${pan}</td>
                </tr>
                ` : ''}
                <tr style="background-color:#f8fafc;">
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:12px; color:#64748b; font-weight:600;">Industry Category:</td>
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:13px; color:#0f172a; font-weight:600;">${industry}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:12px; color:#64748b; font-weight:600;">Store Address:</td>
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:13px; color:#0f172a; font-weight:600;">${address}</td>
                </tr>
                <tr style="background-color:#f8fafc;">
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:12px; color:#64748b; font-weight:600;">Contact Email:</td>
                  <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; font-size:13px; color:#4338ca; font-weight:700;">${email}</td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding:12px 16px; font-size:12px; color:#64748b; font-weight:600;">Contact Phone:</td>
                  <td style="padding:12px 16px; font-size:13px; color:#0f172a; font-weight:600;">${phone}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Footer CTA & Info -->
              <div style="margin-top:32px; padding-top:24px; border-top:1px solid #e2e8f0; text-align:center;">
                <p style="font-size:12px; color:#64748b; line-height:1.5;">
                  If you have any questions regarding your application, reply directly to this email or contact support at <a href="mailto:supportwalletperks@gmail.com" style="color:#4338ca; font-weight:600;">supportwalletperks@gmail.com</a>.
                </p>
              </div>

            </td>
          </tr>

          <!-- Bottom Branding -->
          <tr>
            <td style="background-color:#f1f5f9; padding:20px; text-align:center; font-size:11px; color:#94a3b8;">
              © ${new Date().getFullYear()} WalletPerks Inc. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * HTML Email Template for Mobile Customer Registration
 */
export function buildCustomerRegistrationEmailHtml(params: {
  fullName: string
  email: string
}) {
  const { fullName, email } = params

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to WalletPerks!</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:24px; border:1px solid #e2e8f0; overflow:hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%); padding: 36px 32px; text-align: left;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; tracking-tight: -0.5px;">
                Welcome to WalletPerks 🎉
              </h1>
              <p style="margin:6px 0 0 0; color:#a7f3d0; font-size:13px; font-weight:600;">
                Your digital pass & loyalty wallet is ready!
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size:15px; line-height:1.6; color:#334155; margin-top:0;">
                Hello <strong>${fullName || 'Valued Customer'}</strong>,
              </p>
              <p style="font-size:14px; line-height:1.6; color:#475569;">
                Welcome to <strong>WalletPerks</strong>! Your account (<code>${email}</code>) has been successfully created. You can now earn loyalty rewards, collect digital passes, and enjoy exclusive merchant perks directly in your phone wallet!
              </p>

              <div style="background-color:#ecfdf5; border:1px solid #a7f3d0; border-radius:16px; padding:20px; margin:24px 0; text-align:center;">
                <span style="font-size:24px; display:block; margin-bottom:8px;">📱 VIP Rewards Card Active</span>
                <p style="font-size:13px; color:#047857; margin:0; line-height:1.5; font-weight:600;">
                  Show your mobile QR pass at participating coffee shops, stores, and restaurants to collect stamps and redeem rewards!
                </p>
              </div>

              <!-- Footer CTA -->
              <div style="margin-top:32px; padding-top:24px; border-top:1px solid #e2e8f0; text-align:center;">
                <p style="font-size:12px; color:#64748b; line-height:1.5;">
                  Have questions? Contact our customer team at <a href="mailto:supportwalletperks@gmail.com" style="color:#059669; font-weight:600;">supportwalletperks@gmail.com</a>.
                </p>
              </div>

            </td>
          </tr>

          <!-- Bottom Branding -->
          <tr>
            <td style="background-color:#f1f5f9; padding:20px; text-align:center; font-size:11px; color:#94a3b8;">
              © ${new Date().getFullYear()} WalletPerks Inc. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * HTML Email Template for Merchant Approval Notice
 */
export function buildMerchantApprovalEmailHtml(params: {
  ownerName: string
  businessName: string
}) {
  const { ownerName, businessName } = params

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Approved - WalletPerks</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:24px; border:1px solid #e2e8f0; overflow:hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%); padding: 36px 32px; text-align: left;">
              <div style="display:inline-block; background-color:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); border-radius:12px; padding:6px 14px; color:#ffffff; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">
                Verified Partner
              </div>
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800;">
                Application Approved! 🎉
              </h1>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size:15px; line-height:1.6; color:#334155; margin-top:0;">
                Hello <strong>${ownerName}</strong>,
              </p>
              <p style="font-size:14px; line-height:1.6; color:#475569;">
                Great news! Your business application for <strong>${businessName}</strong> has been officially approved by the WalletPerks admin team.
              </p>

              <div style="background-color:#ecfdf5; border:1px solid #a7f3d0; border-radius:16px; padding:20px; margin:24px 0;">
                <strong style="color:#047857; font-size:14px; display:block; margin-bottom:6px;">Your Merchant Dashboard is Now Unlocked 🚀</strong>
                <p style="color:#065f46; font-size:13px; margin:0; line-height:1.5;">
                  You can now log in to manage store rewards, publish digital wallet pass cards, and view customer loyalty analytics.
                </p>
              </div>

              <!-- Footer CTA -->
              <div style="margin-top:32px; padding-top:24px; border-top:1px solid #e2e8f0; text-align:center;">
                <p style="font-size:12px; color:#64748b; line-height:1.5;">
                  Need help setting up your rewards? Contact your account manager at <a href="mailto:supportwalletperks@gmail.com" style="color:#059669; font-weight:600;">supportwalletperks@gmail.com</a>.
                </p>
              </div>

            </td>
          </tr>

          <tr>
            <td style="background-color:#f1f5f9; padding:20px; text-align:center; font-size:11px; color:#94a3b8;">
              © ${new Date().getFullYear()} WalletPerks Inc. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * HTML Email Template for Merchant Rejection Notice
 */
export function buildMerchantRejectionEmailHtml(params: {
  ownerName: string
  businessName: string
  rejectionReason?: string
}) {
  const { ownerName, businessName, rejectionReason } = params

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Status Update - WalletPerks</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:24px; border:1px solid #e2e8f0; overflow:hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #7f1d1d 100%); padding: 36px 32px; text-align: left;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800;">
                Application Status Update ⚠️
              </h1>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size:15px; line-height:1.6; color:#334155; margin-top:0;">
                Hello <strong>${ownerName}</strong>,
              </p>
              <p style="font-size:14px; line-height:1.6; color:#475569;">
                Thank you for your interest in joining WalletPerks with <strong>${businessName}</strong>. After careful review by our verification team, we are currently unable to approve your business application.
              </p>

              <!-- Rejection Reason Notice Box -->
              <div style="background-color:#fef2f2; border:1px solid #fecaca; border-radius:16px; padding:20px; margin:24px 0;">
                <strong style="color:#991b1b; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px;">Reason for Decision:</strong>
                <p style="color:#7f1d1d; font-size:13px; font-weight:600; margin:0; line-height:1.5;">
                  &quot;${rejectionReason || 'Application does not meet platform merchant verification criteria.'}&quot;
                </p>
              </div>

              <p style="font-size:13px; line-height:1.6; color:#64748b;">
                If you believe this decision was made in error or if you have updated information, you can log in to your account status page to update details or contact support.
              </p>

              <!-- Footer CTA -->
              <div style="margin-top:32px; padding-top:24px; border-top:1px solid #e2e8f0; text-align:center;">
                <p style="font-size:12px; color:#64748b; line-height:1.5;">
                  Questions? Reply to this email or reach out to <a href="mailto:supportwalletperks@gmail.com" style="color:#dc2626; font-weight:600;">supportwalletperks@gmail.com</a>.
                </p>
              </div>

            </td>
          </tr>

          <tr>
            <td style="background-color:#f1f5f9; padding:20px; text-align:center; font-size:11px; color:#94a3b8;">
              © ${new Date().getFullYear()} WalletPerks Inc. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
