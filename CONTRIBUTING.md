# Contributing to Me Chess Book

Thanks for your interest in contributing! 🎉

## 🛠 Development setup

We recommend VS Code with the Dev Containers extension.

### 1. Clone the repository

```bash
git clone https://github.com/HappyPaul55/MeChessBook.git
cd MeChessBook
```

### 2. Open in a dev container (or use Bun locally)

Open the folder in VS Code and, when prompted, reopen in the dev container
(`F1 → Dev Containers: Reopen in Container`). The container installs
dependencies automatically.

Without a container, install [Bun](https://bun.sh) and run:

```bash
bun install
bun run dev
```

### 3. Before opening a pull request

```bash
bun run check      # types
bun test           # unit tests
bun run build      # production build
bun run check:pdf  # print regression check (optional: bunx playwright install chromium)
```

Use **Bun** for everything (`bun`, `bunx`) — never `npm`/`npx`.

## ✅ Pull request checklist

- Your code passes `bun run check`, `bun test` and `bun run build`
- If you touched the book, `bun run check:pdf` passes
- You've followed the coding style and conventions (see `AGENTS.md`)
- Documentation is updated where necessary
- Reference any relevant issue(s) in the PR description

## 📬 Opening a PR

- Push your branch to GitHub
- Open a [pull request](https://github.com/HappyPaul55/MeChessBook/compare) with a
  clear title and description
- Once merged to `main`, CI runs and the site deploys

## 🙌 Thank you

Every bit helps make Me Chess Book better.
