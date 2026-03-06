/**
 * Milestone notification email template
 * Sent when a user reaches a significant platform milestone.
 */

interface MilestoneEmailProps {
  name: string;
  milestone: string;
  description: string;
}

export function MilestoneEmail({ name, milestone, description }: MilestoneEmailProps) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Milestone Reached — ArchiPro AI</title>
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
            <td style="padding:40px;text-align:center;">
              <!-- Trophy icon -->
              <div style="margin:0 auto 24px;width:64px;height:64px;background:#fafafa;border-radius:50%;line-height:64px;font-size:28px;">
                &#127942;
              </div>
              <h2 style="margin:0 0 8px;font-size:24px;font-weight:600;color:#0a0a0a;letter-spacing:-0.02em;">
                ${milestone}
              </h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#737373;">
                Congratulations, ${name}! ${description}
              </p>
              <a href="#" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;">
                View your profile
              </a>
              <hr style="margin:32px 0;border:none;border-top:1px solid #e5e5e5;" />
              <p style="margin:0;font-size:13px;line-height:1.5;color:#a3a3a3;">
                Keep building your presence on ArchiPro AI to unlock more milestones.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#fafafa;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:#a3a3a3;text-align:center;">&copy; ${new Date().getFullYear()} ArchiPro AI. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
