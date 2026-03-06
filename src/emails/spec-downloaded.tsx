/**
 * Specification Downloaded notification email
 * Sent to brands when a product spec sheet is downloaded.
 */

interface SpecDownloadedEmailProps {
  brandName: string;
  productName: string;
  downloadedBy: string;
  downloadedByRole: string;
  downloadedByFirm?: string;
  totalDownloads: number;
  projectName?: string;
}

export function SpecDownloadedEmail({
  brandName,
  productName,
  downloadedBy,
  downloadedByRole,
  downloadedByFirm,
  totalDownloads,
  projectName,
}: SpecDownloadedEmailProps) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Spec Downloaded — ArchiPro AI</title>
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
                    <span style="display:inline-block;background:#eff6ff;color:#3b82f6;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;">SPEC DOWNLOAD</span>
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
                Specification downloaded
              </h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#737373;">
                <strong style="color:#0a0a0a;">${downloadedBy}</strong>${downloadedByFirm ? ` from <strong style="color:#0a0a0a;">${downloadedByFirm}</strong>` : ""} downloaded the specification for <strong style="color:#0a0a0a;">${productName}</strong>.${projectName ? ` This may be for the <strong style="color:#0a0a0a;">${projectName}</strong> project.` : ""}
              </p>

              <!-- Stats row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td width="50%" style="padding-right:6px;">
                    <div style="background:#fafafa;border-radius:16px;padding:20px;text-align:center;">
                      <p style="margin:0;font-size:28px;font-weight:700;color:#0a0a0a;">${totalDownloads}</p>
                      <p style="margin:4px 0 0;font-size:10px;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.05em;">Total downloads</p>
                    </div>
                  </td>
                  <td width="50%" style="padding-left:6px;">
                    <div style="background:#fafafa;border-radius:16px;padding:20px;text-align:center;">
                      <p style="margin:0;font-size:28px;font-weight:700;color:#3b82f6;">&#8595;</p>
                      <p style="margin:4px 0 0;font-size:10px;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.05em;">PDF spec sheet</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Contact info -->
              <div style="background:#fafafa;border-radius:16px;padding:16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="36" valign="top">
                      <div style="width:32px;height:32px;background:#e5e5e5;border-radius:50%;"></div>
                    </td>
                    <td style="padding-left:10px;" valign="top">
                      <p style="margin:0;font-size:13px;font-weight:600;color:#0a0a0a;">${downloadedBy}</p>
                      <p style="margin:2px 0 0;font-size:11px;color:#a3a3a3;">${downloadedByRole}${downloadedByFirm ? ` at ${downloadedByFirm}` : ""}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 32px;">
              <a href="#" style="display:block;background:#0a0a0a;color:#ffffff;padding:14px 24px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;text-align:center;">
                View download analytics
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
