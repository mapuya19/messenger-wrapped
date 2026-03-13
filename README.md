# 💬 Messenger Wrapped

> Explore your Facebook Messenger chat history in a beautiful, Spotify Wrapped-inspired experience. All processing happens locally in your browser—your data never leaves your device.

[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)

## ✨ Features

- 📊 **Comprehensive Statistics** — Message counts, media stats, timeline visualization, and top contributors
- 🎨 **Beautiful Visualizations** — Story-style slideshow with downloadable wrapped images
- 🧠 **Linguistic Analysis** — Reading levels, most used words, and language patterns
- 🎭 **Reaction Analytics** — Most reacted images, videos, and messages
- 🔒 **Privacy First** — 100% local processing, no data leaves your device

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x (recommended) or >= 14.x (minimum)
- **npm** >= 6.x or **yarn** or **pnpm**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mapuya19/messenger-wrapped.git
   cd messenger-wrapped
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 📖 How to Use

### Step 1: Download Your Messenger Data

1. Visit [Facebook's Download Your Information page](https://accountscenter.facebook.com/info_and_permissions/dyi)
2. Click **"Create Export"**
3. Select **"Facebook Profile"**
4. Choose **"Export to device"**
5. Click **"Customize information"** and select **only "Messages"**
6. Set **Date range** to **"Last year"** (or your preferred range)
7. Set **Format** to **"JSON"** (HTML also works)
8. Set **Media quality** to **"Medium"**
9. Click **"Create Export"** and wait for Facebook to prepare your data
10. Download the zip file when ready

### Step 2: Upload Your Data

- **Desktop (Chrome/Edge/Opera)**: Use the File System Access API to select your Messenger folder directly
- **Mobile/Other Browsers**: Upload the zip file you downloaded from Facebook

### Step 3: Explore Your Wrapped

Once your data is processed, you can:
- View your personalized story slideshow
- Explore detailed statistics in the dashboard
- Download your wrapped as images
- Share your insights with friends

## 🏗️ Project Structure

```
messenger-wrapped/
├── src/                    # Source code
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles & Tailwind
│   ├── routes/            # TanStack Router routes
│   │   ├── index.tsx      # Home page
│   │   └── __root.tsx     # Root layout
│   └── routeTree.gen.ts   # Auto-generated routes
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── story/             # Story slideshow components
│   ├── ui/                # Reusable UI components
│   └── upload/            # File upload components
├── contexts/              # React contexts
│   └── ChatDataContext.tsx
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── analyzer/          # Data analysis modules
│   ├── parser/            # Messenger data parser
│   └── utils/             # Helper utilities
├── types/                 # TypeScript type definitions
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsr.config.json        # TanStack Router configuration
```

## 🔒 Privacy & Security

Messenger Wrapped is designed with privacy as a core principle:

- ✅ **100% Local Processing**: All data processing happens in your browser
- ✅ **No Data Collection**: We don't collect, store, or transmit your data
- ✅ **No Server Uploads**: Your Messenger data never leaves your device
- ✅ **No Tracking**: No analytics, tracking, or third-party services
- ✅ **Open Source**: You can review the code to verify our privacy claims

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production preview server
- `npm run lint` - Run ESLint
- `npm run gen` - Generate TanStack Router routes

---

Made by [mapuya19](https://github.com/mapuya19)
