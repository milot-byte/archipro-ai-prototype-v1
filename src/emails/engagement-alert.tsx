/**
 * Engagement alert email template
 * Sent to architects and brands when their content receives notable engagement.
 */

interface EngagementAlertEmailProps {
  name: string;
  metric: string;
  value: number;
  itemName: string;
  itemType: "project" | "product";
}

export function EngagementAlertEmail({
  name,
  metric,
  value,
  itemName,
  itemType,
}: EngagementAlertEmailProps) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Engagement Alert — ArchiPro AI</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#0a0a0a;padding:40px 40px 30px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.02em;">
                ArchiPro <span style="font-weight:300;opacity:0.7;">AI</span>
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#0a0a0a;letter-spacing:-0.02em;">
                Your ${itemType} is trending
              </h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#737373;">
                Hi ${name}, your ${itemType} <strong style="color:#0a0a0a;">${itemName}</strong> has reached <strong style="color:#0a0a0a;">${value.toLocaleString()} ${metric}</strong> this week.
              </p>
              <!-- Stat box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0;font-size:36px;font-weight:600;color:#0a0a0a;">${value.toLocaleString()}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#737373;">${metric} this week</p>
                  </td>
                </tr>
              </table>
              <a href="#" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;">
                View dashboard
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#fafafa;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:#a3a3a3;">&copy; ${new Date().getFullYear()} ArchiPro AI. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
