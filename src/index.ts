import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/login", async (req, res) => {
  let authData = {};
  const { email, password } = req.query;

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://linkedin.com");

  //  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // find elements and type
  const inputElement = await page.$(
    'input[name="session_key"][type="text"][id="session_key"]'
  );

  await inputElement.type(email);

  const passwordElement = await page.$(
    'input[name="session_password"][type="password"][id="session_password"]'
  );

  await passwordElement.type(password);

  await page.click(
    'button[type="submit"][data-tracking-control-name="homepage-basic_sign-in-submit-btn"]'
  );
  // waiting...
  await page.waitForSelector('div[id="artdeco-toasts__wormhole"]');

  // retrieve and store authentication data in memory

  const allLocalStorageData = await page.evaluate(() => {
    const localStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      localStorageData[key] = value;
    }
    return localStorageData;
  });

  const cookies = await page.cookies();

  authData = cookies;

  await browser.close();

  res.json({ allLocalStorageData, authData });
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Welcome",
  });
});

app.listen(4001, () => {
  console.log("app listening");
});
