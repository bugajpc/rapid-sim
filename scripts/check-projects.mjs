import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

await page.getByLabel("Nazwa projektu").fill("Projekt do oceny");
await page.getByRole("button", { name: "Save", exact: true }).click();
await page.waitForTimeout(100);
if (!await page.getByText("Projekt do oceny", { exact: true }).count()) throw new Error("Saved project was not shown");

await page.getByRole("button", { name: "Add point at TCP", exact: true }).click();
await page.waitForTimeout(100);
if (!await page.getByRole("dialog", { name: "Dodaj punkt" }).count()) throw new Error("TCP point dialog did not open");
await page.getByPlaceholder("pCustom").fill("pStudent");
await page.getByRole("button", { name: "Add point", exact: true }).click();
await page.waitForTimeout(100);
if (!await page.getByText(/Dodano punkt pStudent/).count()) throw new Error("Custom point was not created");

console.log("Project persistence and custom point context menu pass.");
await browser.close();
