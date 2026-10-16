// Native builds resolve this file; web resolves ./index.web.ts (the tsconfig
// moduleSuffixes / rsbuild extension order put `.web.ts` first on web). The
// no-op keeps the shared import in src/setup/index.ts compiling on native and
// stops @appduct/web from ever being imported or bundled there.
export default function registerAppductTools() {}
