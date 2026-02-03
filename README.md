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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
