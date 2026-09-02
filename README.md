# Kids Math Game React

Standalone React JavaScript implementation of Kids Math Game, built with Vite.

## Architecture

The game feature follows a feature-first Clean Architecture structure:

```text
src/features/game/
|-- domain/          # Game rules and framework-independent tests
|-- application/     # React use cases and state orchestration
|-- data/            # Random-number repository implementation
`-- presentation/    # Game screens and reusable UI components
```

Dependencies point inward: presentation uses application, application coordinates domain and data, and domain does not depend on React.

## Commands

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```
