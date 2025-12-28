# 💬 Messenger Wrapped

> Explore your Facebook Messenger chat history in a beautiful, Spotify Wrapped-inspired experience. All processing happens locally in your browser—your data never leaves your device.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 📊 **Comprehensive Statistics**
  - Total message count, photos, videos, and audio minutes
  - Chat history timeline visualization
  - Top contributing members analysis

- 🎨 **Beautiful Visualizations**
  - Interactive charts and graphs
  - Story-style slideshow presentation
  - Downloadable wrapped images

- 🧠 **Linguistic Analysis**
  - Reading level analysis for chat members
  - Most used words and phrases
  - Language patterns and insights

- 🎭 **Reaction Analytics**
  - Most reacted images
  - Most reacted videos
  - Most reacted text messages

- 🔒 **Privacy First**
  - 100% local processing—no data leaves your device
  - No server uploads or data collection
  - Works entirely in your browser

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x (recommended) or >= 14.x (minimum)
- **npm** >= 6.x or **yarn** or **pnpm**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/matthewapuya/messenger-wrapped.git
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
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── privacy/           # Privacy policy page
│   ├── terms/             # Terms of use page
│   ├── wrapped/           # Wrapped story view
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
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
└── public/                # Static assets
```

## 🛠️ Technologies

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Recharts](https://recharts.org/)** - Charting library
- **[JSZip](https://stuk.github.io/jszip/)** - Zip file handling
- **[html2canvas](https://html2canvas.hertzen.com/)** - Screenshot generation

## 🔒 Privacy & Security

Messenger Wrapped is designed with privacy as a core principle:

- ✅ **100% Local Processing**: All data processing happens in your browser
- ✅ **No Data Collection**: We don't collect, store, or transmit your data
- ✅ **No Server Uploads**: Your Messenger data never leaves your device
- ✅ **No Tracking**: No analytics, tracking, or third-party services
- ✅ **Open Source**: You can review the code to verify our privacy claims

For more details, see our [Privacy Policy](/privacy) and [Terms of Use](/terms).

## 🌐 Browser Support

- **Desktop**: Chrome, Edge, Opera (File System Access API support)
- **Mobile**: All modern browsers (zip upload)
- **Fallback**: Zip upload works on all platforms

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Spotify Wrapped
- Built with love for the open-source community

## 📧 Contact

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/matthewapuya/messenger-wrapped).

---

Made with ❤️ by [matthewapuya](https://github.com/matthewapuya)
