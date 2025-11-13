# Holiday Extras Arcade Escape Room

An interactive browser-based escape room experience that explores the five Holiday Extras values through engaging puzzle-solving gameplay.

## 🎮 About

This project transforms Holiday Extras' core values into five interactive puzzle rooms, creating an immersive learning experience that combines storytelling, decision-making, and problem-solving.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the game.

## 📁 Project Structure

```
├── app/                  # Next.js app directory
│   ├── page.tsx         # Landing page
│   └── play/            # Game page
├── components/          # React components
│   ├── ui/             # Design system components
│   ├── puzzles/        # Room puzzle components
│   └── layout/         # Layout components (Header, HUD, etc.)
├── lib/                # Core logic
│   ├── GameEngine.ts   # Game state machine
│   └── Storage.ts      # localStorage utilities
├── stores/             # Zustand stores
├── data/               # Game configuration
│   └── gameConfig.json # Room definitions
├── tests/              # Test files
└── public/             # Static assets
    └── assets/         # Game assets

```

## 🎯 The Five Rooms

1. **The Command Deck** - Be At The Helm
2. **The Firewall Zone** - Be Courageous
3. **The Connection Chamber** - Be One Team
4. **The Upgrade Chamber** - Be The Best Version of You
5. **The Innovation Lab** - Be Pioneering in Spirit

## 🧪 Testing

```bash
npm test
```

## 📝 Development Status

Project setup complete. Game implementation in progress.

## 📄 Licence

Private project for Holiday Extras.

