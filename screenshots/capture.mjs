import puppeteer from "puppeteer-core";

const CHROME_PATH = "/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome";

const pages = [
  { name: "1-dashboard", path: "/dashboard" },
  { name: "2-live-activity", path: "/activity" },
  { name: "3-architect-influence", path: "/influence" },
  { name: "4-product-momentum", path: "/momentum" },
  { name: "5-influence-network", path: "/network" },
  { name: "6-boards", path: "/boards" },
  { name: "7-specifications", path: "/specifications" },
  { name: "8-brief-generator", path: "/brief" },
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  for (const page of pages) {
    const tab = await browser.newPage();
    await tab.setViewport({ width: 1440, height: 900 });
    await tab.goto(`http://localhost:3000${page.path}`, { waitUntil: "networkidle2", timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000)); // let animations settle
    await tab.screenshot({
      path: `/home/user/archipro-ai-prototype-v1/screenshots/${page.name}.png`,
      fullPage: true,
    });
    console.log(`✓ ${page.name}`);
    await tab.close();
  }

  await browser.close();
  console.log("Done!");
}

run().catch(console.error);
