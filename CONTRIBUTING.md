# Contributing to Me Chess Book
Thanks for your interest in contributing! 🎉
This guide will help you get started with development and ensure smooth collaboration.

## 🛠 Development Setup
We recommend using VS Code or a compatible IDE that supports Dev Containers.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/me-chess-book.git
cd me-chess-book
```

### 2. Open in a Dev Container
Make sure you have [Dev Containers extension installed in VS Code](https://code.visualstudio.com/docs/devcontainers/containers).

Open the folder in [VS Code](https://code.visualstudio.com/)

When prompted, reopen in the dev container (or use `F1 → Dev Containers: Reopen in Container`)

### 3. Start the Dev Server
Inside the dev container terminal, run:

```bash
pnpm install # optional as it's ran automatically at container boot up time.
pnpm dev
```
This starts the local development server.

### 4. Run a Production Build (for Testing)
Before [opening a pull request](https://github.com/HappyPaul55/MeChessBook/compare), ensure the app builds correctly:

```bash
pnpm build
```

## ✅ Pull Request Checklist
Before submitting [a PR](https://github.com/HappyPaul55/MeChessBook/compare):

 - Your code builds with `pnpm build`
 - You've tested changes locally in the dev container
 - You've followed the coding style and conventions
 - Add or update documentation if necessary
 - Reference any relevant issue(s) in the PR description

## 📬 Opening a PR
When you're ready:

 - Push your branch to [GitHub](https://github.com)
 - Open [a pull request](https://github.com/HappyPaul55/MeChessBook/compare) with a clear title and description
 - Wait for feedback or approval from the maintainers
 - Once merged to `main`, it will be automatically deployed!

## 🙌 Thank You
We appreciate your time and contributions. Every bit helps make [Me Chess Book](http://localhost:3000/) better!