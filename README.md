# 💬 Messenger Wrapped

Explore your Facebook Messenger chat history, in a manner inspired by Spotify Wrapped.

Messenger Wrapped analyzes your uploaded messenger data and shows you interesting facts about a chosen group. This includes:

- Total count of messages, photos, videos and audio minutes
- Most contributing members
- Linguistic level of chat members
- Chat history chart
- Most reacted images
- Most reacted videos
- Most reacted text

The application communicates directly with the file system through the File System Access API (desktop) or processes uploaded zip files (mobile/desktop), meaning that no data needs to be uploaded remotely. Thereby the chat data is not shared or stored anywhere outside of the user's machine.

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Requirements

- Node.js >= 14
- NPM >= 6.x

## 🛠️ Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts

## 📱 Platform Support

- **Desktop**: File System Access API (Chrome, Edge, Opera) or zip upload
- **Mobile**: Zip upload only

## 📄 License

MIT


