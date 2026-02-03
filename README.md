# RedSpike

RedSpike is a modern web-based game built with React, Phaser, and Firebase. It features real-time gameplay, user authentication, and a robust development environment powered by Vite and TypeScript.

## 🚀 Features

- **Phaser Integration**: High-performance 2D gameplay powered by Phaser 3.
- **React UI**: Responsive and dynamic user interface components.
- **Firebase Authentication**: Secure user login and state management.
- **TypeScript**: Type-safe development for both UI and game logic.
- **Vite**: Ultra-fast development server and optimized production builds.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Game Engine**: [Phaser 3](https://phaser.io/)
- **Backend**: [Firebase](https://firebase.google.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd RedSpike
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173/`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be generated in the `dist` directory.

### Linting

Run ESLint to check for code quality:
```bash
npm run lint
```

## 📁 Project Structure

- `src/game/`: Phaser game logic, scenes, and objects.
- `src/pages/`: React page components (Landing Page, Game Page).
- `src/firebase/`: Firebase configuration and Authentication context.
- `src/components/`: Reusable React components.
- `public/`: Static assets for the game and UI.

## Inspiration

We grew up playing classic infinite climbers like **Doodle Jump** and **Icy Tower**—games that were simple, addictive, and endlessly replayable. But we noticed a problem: most casual games today require app downloads, storage space, and constant updates. We wanted to bring back that nostalgic arcade experience and make it **instantly accessible to anyone with a browser**. No downloads, no waiting—just pure gaming fun. RedSpike was born from the idea that great games should be frictionless.

## What it does

RedSpike is a **browser-based infinite climber game** where players control a hero jumping through procedurally generated platforms. The goal is simple: climb as high as you can while dodging enemies (bugs) and collecting coins (stars). 

Key features include:
- **Procedural level generation** that creates unique, fair levels every time
- **Google Sign-In integration** for seamless authentication
- **Global leaderboards** to compete with players worldwide
- **Responsive design** that works on desktop and mobile browsers
- **Progressive difficulty** that scales as you climb higher

## How we built it

We combined modern web technologies to create a seamless gaming experience:

- **React** for the user interface, landing page, and HUD components
- **Phaser 3** as our high-performance 2D game engine handling physics, sprites, and animations
- **TypeScript** for type-safe development across the entire codebase
- **Firebase** for Google authentication and real-time database for leaderboards
- **Vite** for lightning-fast development and optimized production builds

Our level generation algorithm uses a **reachability guarantee system**—it calculates jump physics (velocity, gravity, air time) to ensure every platform is mathematically reachable. No impossible levels, ever.

## Challenges we ran into

1. **Physics-based reachability**: Ensuring procedurally generated platforms are always jumpable required reverse-engineering the physics engine. We had to calculate maximum jump distances using kinematic equations and validate platform placement in real-time.

2. **Sprite transparency issues**: Our game assets had white backgrounds instead of transparency. We wrote Node.js scripts using the `sharp` library to process and fix all sprites.

3. **Firebase authentication edge cases**: The Google Sign-In popup flow had unexpected behaviors on certain browsers. Debugging OAuth redirects and popup closure detection took significant effort.

4. **Performance optimization**: Infinite scrolling games can cause memory leaks. We implemented an object pooling system that recycles platforms as they scroll off-screen instead of destroying and recreating them.

## Accomplishments that we're proud of

- **Zero-download gaming**: Players can start playing within seconds of visiting our URL
- **Fair procedural generation**: Our algorithm guarantees 100% of generated levels are beatable
- **Smooth 60 FPS gameplay**: Optimized physics and rendering for buttery-smooth performance
- **Complete authentication flow**: Secure Google Sign-In with persistent sessions
- **Adaptive difficulty**: The game scales challenge based on player progress, keeping it engaging without becoming frustrating

## What we learned

- **Game physics design**: How jump velocity, gravity, and air time translate into level design constraints
- **Procedural generation techniques**: Building systems that balance randomness with guaranteed playability
- **React + Phaser integration**: Managing state between a game engine and a UI framework
- **Firebase best practices**: OAuth flows, real-time database structure, and security rules
- **Web game optimization**: Object pooling, camera culling, and memory management for infinite games

## What's next for RedSpike

- **Multiplayer mode**: Real-time racing where players compete to climb fastest
- **Power-ups and abilities**: Jetpacks, shields, and temporary speed boosts
- **Custom skins**: Unlockable character customization through achievements
- **Daily challenges**: Seeded levels where all players compete on the same map
- **Mobile PWA**: Install as a progressive web app for native-like experience
- **Tournament system**: Scheduled competitive events with prizes
- **Level editor**: Let players create and share their own challenge courses

## Built With

- **react** - UI framework for landing page, dashboard, and game HUD
- **phaser** - High-performance 2D game engine for physics and rendering
- **typescript** - Type-safe development for robust, maintainable code
- **firebase** - Authentication (Google Sign-In) and real-time database
- **vite** - Next-generation frontend build tool
- **node.js** - Asset processing scripts and build tooling
- **css** - Custom styling and animations
- **html5** - Canvas-based game rendering
- **javascript** - Core game logic and interactions


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
