import initSkiaForCli from './initSkiaForCli';

// Skia must be initialized before cli.tsx and its transitive imports are evaluated.
// The dynamic import ensures initSkiaForCli() runs first — static imports in cli.tsx
// would otherwise be hoisted above any top-level await in this file.
await initSkiaForCli();
await import('./initOnyxForCli');
await import('./cli');
