/**
 * Product Saved notification email
 * Sent to brands when their product is saved by an architect or homeowner.
 */

interface ProductSavedEmailProps {
  brandName: string;
  productName: string;
  savedBy: string;
  savedByRole: string;
  savedByFirm?: string;
  totalSaves: number;
  productUrl: string;
}

export function ProductSavedEmail({
  brandName,
  productName,
  savedBy,
  savedByRole,
  savedByFirm,
  totalSaves,
  productUrl,
}: ProductSavedEmailProps) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Product Saved — ArchiPro AI</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <!-- Minimal header -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:17px;font-weight:600;color:#0a0a0a;letter-spacing:-0.02em;">ArchiPro</span>
                    <span style="font-size:17px;font-weight:300;color:#a3a3a3;margin-left:4px;">AI</span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:#fef2f2;color:#ef4444;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;">NEW SAVE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:20px 40px 0;">
              <div style="height:1px;background:#f0f0f0;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:28px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#0a0a0a;letter-spacing:-0.03em;line-height:1.3;">
                Your product was saved
              </h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#737373;">
                <strong style="color:#0a0a0a;">${savedBy}</strong>${savedByFirm ? ` from <strong style="color:#0a0a0a;">${savedByFirm}</strong>` : ""} saved <strong style="color:#0a0a0a;">${productName}</strong> to their collection.
              </p>

              <!-- Product card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="60" valign="top">
                          <div style="width:52px;height:52px;background:#e5e5e5;border-radius:12px;"></div>
                        </td>
                        <td style="padding-left:12px;" valign="top">
                          <p style="margin:0;font-size:15px;font-weight:600;color:#0a0a0a;">${productName}</p>
                          <p style="margin:4px 0 0;font-size:12px;color:#a3a3a3;">by ${brandName}</p>
                        </td>
                        <td align="right" valign="top">
                          <div style="text-align:center;">
                            <p style="margin:0;font-size:24px;font-weight:700;color:#0a0a0a;">${totalSaves}</p>
                            <p style="margin:2px 0 0;font-size:10px;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.05em;">Total saves</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Saved by info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#fafafa;border-radius:16px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:32px;height:32px;background:#e5e5e5;border-radius:50%;"></div>
                        </td>
                        <td style="padding-left:10px;" valign="top">
                          <p style="margin:0;font-size:13px;font-weight:600;color:#0a0a0a;">${savedBy}</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#a3a3a3;">${savedByRole}${savedByFirm ? ` at ${savedByFirm}` : ""}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;">
              <a href="${productUrl}" style="display:block;background:#0a0a0a;color:#ffffff;padding:14px 24px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;text-align:center;">
                View product analytics
              </a>
            </td>
          </tr>

          <!-- Footer -->
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
