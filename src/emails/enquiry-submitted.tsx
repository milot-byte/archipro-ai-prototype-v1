/**
 * Enquiry Submitted notification email
 * Sent to brands when someone submits an enquiry about their product.
 */

interface EnquirySubmittedEmailProps {
  brandName: string;
  productName: string;
  enquirerName: string;
  enquirerRole: string;
  enquirerFirm?: string;
  enquirerEmail: string;
  message: string;
  projectName?: string;
}

export function EnquirySubmittedEmail({
  brandName,
  productName,
  enquirerName,
  enquirerRole,
  enquirerFirm,
  enquirerEmail,
  message,
  projectName,
}: EnquirySubmittedEmailProps) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New Enquiry — ArchiPro AI</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:17px;font-weight:600;color:#0a0a0a;">ArchiPro</span>
                    <span style="font-size:17px;font-weight:300;color:#a3a3a3;margin-left:4px;">AI</span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:#fefce8;color:#ca8a04;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;">NEW ENQUIRY</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="padding:20px 40px 0;"><div style="height:1px;background:#f0f0f0;"></div></td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#0a0a0a;letter-spacing:-0.03em;">
                New enquiry received
              </h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#737373;">
                <strong style="color:#0a0a0a;">${enquirerName}</strong> submitted an enquiry about <strong style="color:#0a0a0a;">${productName}</strong>.${projectName ? ` This is for the <strong style="color:#0a0a0a;">${projectName}</strong> project.` : ""}
              </p>

              <!-- Message -->
              <div style="background:#fafafa;border-radius:16px;padding:20px;border-left:3px solid #0a0a0a;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#404040;font-style:italic;">
                  &ldquo;${message}&rdquo;
                </p>
              </div>

              <!-- Contact card -->
              <div style="margin-top:16px;background:#fafafa;border-radius:16px;padding:20px;">
                <p style="margin:0 0 12px;font-size:10px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.08em;">
                  Contact Details
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="36" valign="top">
                      <div style="width:36px;height:36px;background:#e5e5e5;border-radius:50%;"></div>
                    </td>
                    <td style="padding-left:12px;" valign="top">
                      <p style="margin:0;font-size:14px;font-weight:600;color:#0a0a0a;">${enquirerName}</p>
                      <p style="margin:2px 0 0;font-size:12px;color:#737373;">${enquirerRole}${enquirerFirm ? ` at ${enquirerFirm}` : ""}</p>
                      <p style="margin:6px 0 0;">
                        <a href="mailto:${enquirerEmail}" style="font-size:12px;color:#0a0a0a;text-decoration:underline;">${enquirerEmail}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Product reference -->
              <div style="margin-top:16px;background:#fafafa;border-radius:16px;padding:16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="48" valign="top">
                      <div style="width:44px;height:44px;background:#e5e5e5;border-radius:10px;"></div>
                    </td>
                    <td style="padding-left:12px;" valign="middle">
                      <p style="margin:0;font-size:13px;font-weight:600;color:#0a0a0a;">${productName}</p>
                      <p style="margin:2px 0 0;font-size:11px;color:#a3a3a3;">by ${brandName}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 12px;">
              <a href="mailto:${enquirerEmail}" style="display:block;background:#0a0a0a;color:#ffffff;padding:14px 24px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;text-align:center;">
                Reply to ${enquirerName}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <a href="#" style="display:block;background:#ffffff;color:#0a0a0a;padding:14px 24px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;text-align:center;border:1px solid #e5e5e5;">
                View all enquiries
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px;background:#fafafa;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:11px;color:#a3a3a3;text-align:center;">
                &copy; ${new Date().getFullYear()} ArchiPro AI &middot; <a href="#" style="color:#a3a3a3;text-decoration:underline;">Notification settings</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
