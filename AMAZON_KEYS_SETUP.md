# Setting Up Amazon Product Advertising API Keys

Souvenir Spartan uses Amazon’s Product Advertising API (PA-API 5.0) to show live shoe products. You need three values in your `.env` file: **Access Key**, **Secret Key**, and **Associate Tag**.

---

## 1. Have an Amazon Associates Account

- If you don’t have one: [Join Amazon Associates](https://affiliate-program.amazon.com/).
- Your account must be **approved** (not pending). Only the **primary account holder** can register for PA-API.
- Approval can take a few days. Use the [Associates Contact Us](https://affiliate-program.amazon.com/contact) form if you need to ask about status.

---

## 2. Register for the Product Advertising API

1. Sign in at [Amazon Associates](https://affiliate-program.amazon.com/).
2. In the top menu, go to **Tools** → **Product Advertising API**.
3. Click **Join** (or **Add Credentials** if you’ve already joined).
4. Accept the terms and complete the signup.

---

## 3. Get Your Access Key and Secret Key

1. After joining PA-API, you’ll see a **Download credentials** (or similar) page.
2. You’ll see:
   - **Access Key** (long string, e.g. `AKIA...`)
   - **Secret Key** (long string; you may only see it once)
3. **Copy both** and store them somewhere safe. If you lose the Secret Key, you’ll need to create a new key pair in PA-API.

You can manage keys later: **Tools** → **Product Advertising API** → **Manage Your Account** → **Add Credentials** or **Delete**. You can have up to two key pairs.

---

## 4. Get Your Associate Tag (Tracking ID)

1. In [Amazon Associates](https://affiliate-program.amazon.com/), go to **Account** (or **Manage Your Account**).
2. Find **Tracking ID** (or **Associate Tag**). It looks like: `yoursite-20` or `souvenirspartan-20`.
3. Copy this value; this is your **Associate Tag**.

---

## 5. Add Keys to Your Project

1. In the project root (same folder as `server.js`), copy the example env file:
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux: `cp .env.example .env`)

2. Open `.env` in an editor.

3. Fill in your values (no quotes, no spaces around `=`):
   ```env
   AMAZON_ACCESS_KEY=AKIAXXXXXXXXXXXXXXXX
   AMAZON_SECRET_KEY=your_secret_key_here
   AMAZON_ASSOCIATE_TAG=souvenirspartan-20
   AMAZON_REGION=us-east-1
   ```

4. Save the file.

5. **Important:** `.env` is in `.gitignore`. Do not commit it or share it; it contains secrets.

---

## 6. Restart the Server

```bash
npm start
```

You should see something like: `categories [shoes]: Amazon; others: local`.  
Then open the **Shoes** category on the site; products should load from Amazon.

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| Shoes still show local products | `.env` is in the project root, variable names are exact, no typos, server was restarted. |
| "Missing credentials" or empty shoes | `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, and `AMAZON_ASSOCIATE_TAG` are all set and have no extra spaces. |
| API errors in server logs | Associate account approved; PA-API signup completed; use **PA-API credentials** from Associates, not AWS IAM keys. |
| "RequestThrottled" or rate errors | You’re hitting PA-API limits; wait a bit and try again. |

---

## Optional: Use Amazon for More Categories

By default only **shoes** use Amazon. To add more categories, set:

```env
AMAZON_CATEGORIES=shoes,shirts,pants
```

Categories: `shoes`, `shirts`, `pants`, `merch`, `travel`, `collectables`.
