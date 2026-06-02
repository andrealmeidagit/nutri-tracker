# 🌟 NutriFlow - Premium Calorie & Macro Tracker

NutriFlow is a visually stunning, premium, offline-first fitness calculator and journaling application designed to track your daily calorie budgets, macronutrient ratios, water intake, body weight trends, and custom meal logs.

Built with modern glassmorphism design aesthetics, reactive layouts, and client-side encryption, NutriFlow operates 100% offline inside your browser sandbox, guaranteeing absolute privacy and ownership of your physical data.

---

## ✨ Features

- **🛡️ 100% Offline Privacy Custody**: Every byte of personal data is encrypted and saved strictly inside your browser's local sandbox (via LocalStorage). No trackers, no analytical cookies, and zero server network calls.
- **🎨 Live Global Accent Themes**: Choose from vibrant color schemes like **Purple Glow**, **Orange Blaze (Protein)**, **Cyan Wave (Carbs)**, **Green Emerald (Fats)**, or **Sky Blue (Hydration)**. The entire application (active tab lines, primary action buttons, SVG rings, shadows, and focus outlines) adapts natively.
- **📊 Interactive Calorie Circle Progress Ring**: A smooth SVG progress ring displaying remaining calories and macros, updating proportionally in real-time as you log or edit items.
- **🎛️ Collapsible & Adaptive Meal Decks**: Dedicated cards for **Breakfast**, **Lunch**, **Dinner**, and **Snacks** featuring responsive mobile stacking grids and macro metrics.
- **✏️ Proportional Serving Editor**: Edit existing logged items instantly to scale or override portion weight, calories, and macros with seamless live recalculations.
- **💧 Inline Hydration Tracker**: A custom liquid-filled glass widget with active wave animations and inline text-editing for instant volume adjustments.
- **📈 Trailing Trajectory Analytics**: Chart.js integration charting trailing 7-day calorie inputs and body weight progressions centered around your active selected date.
- **🔒 Triple-Check Purge System**: A secure three-step wizard to permanently wipe browser cache data safely, prompting for local backup downloads and requiring a typed confirmation.
- **📥 Local JSON Backup & Recovery**: Export a local JSON backup of your profiles, records, and statistics, and restore them instantly from the dashboard or the onboarding page.

---

## 🛠️ Technology Stack

- **Core Structure**: HTML5 (Descriptive Semantic Markup)
- **Styling**: Vanilla CSS3 (Custom Properties, Glassmorphism, Micro-animations, CSS Grid & Flexbox)
- **Application Logic**: Vanilla JavaScript ES6 (Event-driven controller, local encrypted state)
- **Visual Graphing**: Chart.js (External CDN Integration)

---

## 🚀 How to Run Locally

Since NutriFlow operates strictly on client-side static assets, you can run it on your machine instantly with any basic static file server:

### Option A: Python (Built-in)
Open a terminal in the project directory and run:
```bash
python -m http.server 8080
```
Then navigate to: **[http://localhost:8080](http://localhost:8080)**

### Option B: Node.js / NPM
```bash
npx http-server -p 8080
```

### Option C: VS Code extension
If you use VS Code, install the **Live Server** extension, open the project directory, and click the **Go Live** button in the bottom status bar.

---

## 🌐 How to Host Online (Free)

### 1. Zero-Git Deployment (Netlify Drop)
1. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**.
2. Drag and drop the `nutri-tracker` directory onto the upload area.
3. Your site is instantly live! Create a free Netlify account to customize your subdomain.

### 2. Private Code Hosting (Vercel - Recommended)
To keep your source code 100% private on GitHub but host the page online for free:
1. Push your folder to a **Private Repository** on GitHub.
2. Go to **[vercel.com](https://vercel.com/)** and sign up using your GitHub account.
3. Import your private repository and click **Deploy**. Vercel will automatically update your live site every time you run `git push`.

### 3. Public Code Hosting (GitHub Pages)
If you make your repository **Public**:
1. Go to your repository settings page on GitHub.com.
2. Click **Pages** in the left sidebar under "Code and automation".
3. Under "Build and deployment", select the `main` branch and click **Save**.
4. Your site will be published at `https://andrealmeidagit.github.io/nutri-tracker/`.
