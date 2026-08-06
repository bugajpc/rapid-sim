import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

for (const width of [440, 360, 300]) {
  await page.evaluate((nextWidth) => {
    const workspace = document.querySelector(".workspace");
    workspace.style.gridTemplateColumns = `212px minmax(300px, 1fr) 6px ${nextWidth}px`;
  }, width);
  await page.waitForTimeout(100);
  const sizes = await page.evaluate(() => {
    const box = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width };
    };
    const info = document.querySelector(".sim-info");
    return { editor: box(".editor-panel"), editorView: box(".monaco-editor"), panel: box(".sim-panel"), footer: box(".sim-footer"), info: box(".sim-info"), canvas: box(".canvas"), footerScrollWidth: info.scrollWidth, footerClientWidth: info.clientWidth, bodyWidth: document.body.scrollWidth };
  });
  console.log(width, sizes);
}

for (const deltaX of [-100, 180, -120]) {
  const handle = page.locator(".resize-handle");
  const handleBox = await handle.boundingBox();
  await page.mouse.move(handleBox.x + 3, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox.x + 3 + deltaX, handleBox.y + handleBox.height / 2);
  await page.mouse.up();
  await page.waitForTimeout(100);
  const sizes = await page.evaluate(() => {
    const box = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width };
    };
    const info = document.querySelector(".sim-info");
    return { editor: box(".editor-panel"), editorView: box(".monaco-editor"), panel: box(".sim-panel"), footer: box(".sim-footer"), info: box(".sim-info"), canvas: box(".canvas"), footerScrollWidth: info.scrollWidth, footerClientWidth: info.clientWidth };
  });
  console.log(`drag ${deltaX}`, sizes);
  if (sizes.panel.width !== sizes.footer.width || sizes.panel.width !== sizes.info.width || sizes.panel.width !== sizes.canvas.width) throw new Error("Simulation children do not match panel width");
  if (Math.abs(sizes.editor.width - sizes.editorView.width) > 1) throw new Error("Monaco editor does not match editor panel width");
  if (sizes.footerScrollWidth > sizes.footerClientWidth) throw new Error("Simulation footer overflows horizontally");
}

await browser.close();
