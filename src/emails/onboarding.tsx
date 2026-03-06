/**
 * Onboarding welcome email template
 * Sent when a new user (homeowner, architect, or brand) signs up.
 */

interface OnboardingEmailProps {
  name: string;
  role: "homeowner" | "architect" | "brand";
}

export function OnboardingEmail({ name, role }: OnboardingEmailProps) {
  const roleMessages = {
    homeowner: "Start by generating an AI design brief to kickstart your project.",
    architect: "Complete your studio profile and upload your first project to get discovered.",
    brand: "Set up your product library and start connecting with architects.",
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to ArchiPro AI</title>
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
                Welcome, ${name}.
              </h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#737373;">
                Your account is set up and ready to go. ${roleMessages[role]}
              </p>
              <a href="#" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;">
                Get started
              </a>
              <hr style="margin:32px 0;border:none;border-top:1px solid #e5e5e5;" />
              <p style="margin:0;font-size:13px;line-height:1.5;color:#a3a3a3;">
                If you have questions, reply to this email or visit our help centre.
              </p>
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
