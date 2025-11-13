# Holiday Extras Arcade Escape Room 🎮

A fully interactive, browser-based escape room experience that brings the five Holiday Extras values to life through engaging puzzles and immersive storytelling. Built with Next.js 14, TypeScript, and Framer Motion.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-Private-red)

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [The Five Rooms](#the-five-rooms)
- [Architecture](#architecture)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Deployment](#deployment)
- [Development](#development)
- [Contributing](#contributing)

## 🎯 About

The Holiday Extras Arcade Escape Room transforms Holiday Extras' five core values into an interactive gaming experience. Players navigate through five unique puzzle rooms, each representing one value, with the mission to restore the malfunctioning AI Core.

**Live Demo:** [Coming Soon]

**Key Technologies:**
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- Vitest for testing

## ✨ Features

- 🎮 **5 Interactive Puzzle Rooms** - Each room features unique mechanics and challenges
- 💾 **Progress Persistence** - Automatic save using localStorage
- ♿ **Fully Accessible** - WCAG 2.1 AA compliant with full keyboard navigation
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 🎨 **Beautiful Animations** - Smooth transitions with `prefers-reduced-motion` support
- 🎯 **Branching Narratives** - Player choices affect outcomes
- 🏆 **Score System** - Track performance with time and hint bonuses
- 🔊 **Audio Ready** - Prepared for sound effects integration

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.9.0 or higher
- **npm** 10.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/ayohx/HX-Value-Escape-Room.git

# Navigate to project directory
cd "HX Value Escape Room"

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
/Users/ayo.ogunrekun/Projects/HX Value Escape Room/
├── app/                          # Next.js app directory
│   ├── globals.css              # Global styles with accessibility focus
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Landing page with hero and CTAs
│   └── play/
│       └── page.tsx             # Main game page with full integration
│
├── components/
│   ├── ui/                      # Reusable design system components
│   │   ├── Button.tsx          # Accessible button with variants
│   │   ├── Card.tsx            # Container component
│   │   ├── Modal.tsx           # Accessible modal dialogs
│   │   ├── Toast.tsx           # Notification system
│   │   └── ProgressBar.tsx     # Animated progress indicator
│   │
│   ├── layout/                  # Game layout components
│   │   ├── Header.tsx          # Top navigation with progress
│   │   ├── HUD.tsx             # Heads-up display wrapper
│   │   ├── AICore.tsx          # Animated AI Core visual
│   │   └── RoomStage.tsx       # Puzzle presentation wrapper
│   │
│   └── puzzles/                 # Room-specific puzzle components
│       ├── ReorderPuzzle.tsx   # Room 1: Drag & drop reordering
│       ├── TimedChoice.tsx     # Room 2: Timed decision making
│       ├── ConnectNodesPuzzle.tsx  # Room 3: Multi-step grid puzzle
│       ├── MatchingChoice.tsx  # Room 4: Pair matching + power-ups
│       └── FinalPuzzle.tsx     # Room 5: Innovation philosophy
│
├── lib/                         # Core business logic
│   ├── GameEngine.ts           # Finite state machine + validation
│   ├── Storage.ts              # localStorage wrapper with schemas
│   └── types.ts                # TypeScript type definitions
│
├── stores/
│   └── gameStore.ts            # Zustand store for game state
│
├── data/
│   └── gameConfig.json         # Room definitions and rules
│
├── tests/                       # Test suites
│   ├── gameEngine.test.ts      # Core logic tests
│   ├── integration/
│   │   └── fullGame.test.ts    # End-to-end playthrough
│   └── components/
│       └── Button.test.tsx     # Component unit tests
│
└── public/
    └── assets/
        ├── placeholders/        # SVG placeholder assets
        │   ├── room-helm.svg
        │   ├── room-firewall.svg
        │   ├── room-connection.svg
        │   ├── room-upgrade.svg
        │   └── room-innovation.svg
        └── audio/              # Audio asset specifications
            └── README.md
```

## 🎯 The Five Rooms

### 1. The Command Deck - Be At The Helm
**Puzzle Type:** Reorder  
**Mechanic:** Drag-and-drop or keyboard reordering  
**Learning:** "Leaders act with clarity, not certainty — they steer forward when others hesitate."

### 2. The Firewall Zone - Be Courageous
**Puzzle Type:** Timed Choice (30 seconds)  
**Mechanic:** Decision under pressure with branching path  
**Learning:** "Courage means acting despite fear."  
**Special:** Includes hidden "red button" event for extra courage test

### 3. The Connection Chamber - Be One Team
**Puzzle Type:** Multi-step  
**Mechanic:** Colleague response choice + 3x3 node connection grid  
**Learning:** "Collaboration creates clarity — unity unlocks the next level."

### 4. The Upgrade Chamber - Be The Best Version of You
**Puzzle Type:** Matching + Choice  
**Mechanic:** Match old/new traits, then select power-up  
**Learning:** "Growth fuels excellence — self-improvement powers the whole system."  
**Correct Answer:** Curiosity

### 5. The Innovation Lab - Be Pioneering in Spirit
**Puzzle Type:** Philosophy Final  
**Mechanic:** Innovation choice + philosophical question  
**Learning:** "Each misstep sparks innovation, each setback fuels progress."  
**Correct Answer:** Failure (as the key to discovery)

## 🏗️ Architecture

### Game Engine

The `GameEngine` class implements a finite state machine with these states:
- `idle` → `briefing` → `tutorial` (optional) → `playing` → `result_success/result_fail` → `completed`

### State Management

- **Zustand Store:** Manages current game state, room data, and timer
- **localStorage:** Persists player progress with this schema:

```typescript
{
  playerId: "anon-<uuid>",
  startedAt: "ISO-8601",
  currentRoomId: "room1_helm",
  rooms: {
    room1_helm: {
      status: "completed",
      timeTakenSec: 12,
      attempts: 1,
      choices: ["Plan", "Decide", "Communicate", "Act"],
      score: 95,
      hintsUsed: 0
    }
  },
  totalScore: 465
}
```

### Component Communication

1. **Play Page** manages overall game flow
2. **GameEngine** validates answers and updates progress
3. **Zustand Store** synchronises state across components
4. **Storage** persists progress to localStorage
5. **Event System** emits game events (roomStarted, roomCompleted, etc.)

## ♿ Accessibility

The game is built with accessibility as a core requirement:

- ✅ **WCAG 2.1 AA Compliant**
- ✅ **Full Keyboard Navigation** (Tab, Enter, Space, Arrow keys)
- ✅ **ARIA Labels** on all interactive elements
- ✅ **Screen Reader Support** with live regions for dynamic content
- ✅ **Focus Management** with visible focus indicators
- ✅ **Colour Contrast** 4.5:1 minimum ratio
- ✅ **Reduced Motion** respects `prefers-reduced-motion`
- ✅ **Semantic HTML** with proper heading hierarchy
- ✅ **Alt Text** on all visual elements

### Keyboard Shortcuts

- `Tab` / `Shift+Tab` - Navigate between elements
- `Enter` / `Space` - Activate buttons and selections
- `Arrow Keys` / `W/S` - Reorder items in Room 1
- `Escape` - Close modals and pause game

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **Unit Tests:** GameEngine logic and room validation
- **Component Tests:** UI component behaviour and accessibility
- **Integration Tests:** Full game playthrough scenario

### Test Scenarios

1. ✅ Complete all 5 rooms successfully
2. ✅ Handle failures and retries
3. ✅ Progress persistence across page reloads
4. ✅ Correct score calculation
5. ✅ Room validation logic

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deployment Platforms

The app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Any static hosting** (after `next export`)

### Environment Variables

No environment variables required for base deployment.

## 💻 Development

### Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting (if configured)
- **British English** for all user-facing text

### Adding New Rooms

1. Add room definition to `data/gameConfig.json`
2. Create puzzle component in `components/puzzles/`
3. Add validation logic to `GameEngine.validateRoomAnswer()`
4. Update room rendering in `app/play/page.tsx`
5. Add tests for new room
6. Create placeholder asset SVG

### Modifying Existing Rooms

Room definitions in `gameConfig.json` can be modified without code changes for:
- Instructions
- Choices
- Correct answers
- Success/fail messages
- Learning text

## 🤝 Contributing

This is a private project for Holiday Extras. For contributions:

1. Create a feature branch from `main`
2. Make your changes with tests
3. Ensure all tests pass
4. Submit a pull request with description

## 📝 Changelog

### Version 1.0.0 (November 2025)

- ✅ Complete game implementation with 5 rooms
- ✅ Full accessibility support
- ✅ Progress persistence
- ✅ Comprehensive test suite
- ✅ Placeholder assets
- ✅ Documentation

## 📄 Licence

Private project for Holiday Extras Ltd. All rights reserved.

## 👏 Credits

Built with ❤️ for Holiday Extras

**Technologies:**
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Vitest](https://vitest.dev/)

---

**Need Help?** Contact the development team or check the [How to Play] guide in the game.

