/**
 * Product Trending notification email
 * Sent to brands when their product enters "surging" or "rising" momentum status.
 */

interface ProductTrendingEmailProps {
  brandName: string;
  productName: string;
  momentumScore: number;
  trend: "surging" | "rising";
  weeklyViews: number;
  viewsGrowth: number;
  weeklySaves: number;
  savesGrowth: number;
  weeklySpecs: number;
  specsGrowth: number;
}

export function ProductTrendingEmail({
  brandName,
  productName,
  momentumScore,
  trend,
  weeklyViews,
  viewsGrowth,
  weeklySaves,
  savesGrowth,
  weeklySpecs,
  specsGrowth,
}: ProductTrendingEmailProps) {
  const trendLabel = trend === "surging" ? "SURGING" : "RISING";
  const trendColor = trend === "surging" ? "#ef4444" : "#f59e0b";
  const trendBg = trend === "surging" ? "#fef2f2" : "#fffbeb";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Product Trending — ArchiPro AI</title>
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
                    <span style="display:inline-block;background:${trendBg};color:${trendColor};padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;">${trendLabel}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="padding:20px 40px 0;"><div style="height:1px;background:#f0f0f0;"></div></td></tr>

          <!-- Hero -->
          <tr>
            <td style="padding:28px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#0a0a0a;letter-spacing:-0.03em;">
                ${productName} is trending
              </h1>
              <p style="margin:0 0 28px;font-size:14px;line-height:1.7;color:#737373;">
                Your product has entered <strong style="color:${trendColor};">${trend}</strong> status on ArchiPro AI with a momentum score of <strong style="color:#0a0a0a;">${momentumScore}/100</strong>.
              </p>

              <!-- Momentum score -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0;font-size:48px;font-weight:700;color:#ffffff;">${momentumScore}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.08em;">Momentum Score</p>
                    <!-- Score bar -->
                    <div style="margin:16px auto 0;max-width:300px;height:6px;background:#333333;border-radius:3px;overflow:hidden;">
                      <div style="width:${momentumScore}%;height:100%;background:#ffffff;border-radius:3px;"></div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Metrics -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td width="33%" style="padding-right:5px;">
                    <div style="background:#fafafa;border-radius:16px;padding:16px;text-align:center;">
                      <p style="margin:0;font-size:22px;font-weight:700;color:#0a0a0a;">${weeklyViews.toLocaleString()}</p>
                      <p style="margin:2px 0 0;font-size:10px;color:#a3a3a3;text-transform:uppercase;">Views</p>
                      <p style="margin:4px 0 0;font-size:11px;font-weight:600;color:#22c55e;">+${viewsGrowth}%</p>
                    </div>
                  </td>
                  <td width="33%" style="padding:0 3px;">
                    <div style="background:#fafafa;border-radius:16px;padding:16px;text-align:center;">
                      <p style="margin:0;font-size:22px;font-weight:700;color:#0a0a0a;">${weeklySaves}</p>
                      <p style="margin:2px 0 0;font-size:10px;color:#a3a3a3;text-transform:uppercase;">Saves</p>
                      <p style="margin:4px 0 0;font-size:11px;font-weight:600;color:#22c55e;">+${savesGrowth}%</p>
                    </div>
                  </td>
                  <td width="33%" style="padding-left:5px;">
                    <div style="background:#fafafa;border-radius:16px;padding:16px;text-align:center;">
                      <p style="margin:0;font-size:22px;font-weight:700;color:#0a0a0a;">${weeklySpecs}</p>
                      <p style="margin:2px 0 0;font-size:10px;color:#a3a3a3;text-transform:uppercase;">Specs</p>
                      <p style="margin:4px 0 0;font-size:11px;font-weight:600;color:#22c55e;">+${specsGrowth}%</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;">
              <a href="#" style="display:block;background:#0a0a0a;color:#ffffff;padding:14px 24px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;text-align:center;">
                View momentum dashboard
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
