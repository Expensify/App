// Provides Bun runtime types for the VCR CLI without importing the `"bun"` module.
//
// Importing `"bun"` (as bun-types/bun.ns.d.ts does via `import * as BunModule from "bun"`)
// causes TypeScript to resolve @types/bun, which loads bun-types/globals.d.ts.
// That file redeclares `var require: NodeJS.Require`, conflicting with
// @types/react-native's `var require: NodeRequire` — the declaration that enables the
// generic `require<T>` overload used by main-app files like LottieAnimations.
//
// Instead, we forward-declare only what VCR actually uses.

/** Bun file handle returned by Bun.file(). */
type BunFile = {
    bytes(): Promise<Uint8Array>;
    text(): Promise<string>;
    arrayBuffer(): Promise<ArrayBuffer>;
};

/** Subset of Bun.BuildResult used by assertBuildSuccess and the build/dev scripts. */
type BunBuildResult = {
    success: boolean;
    outputs: Blob[];
    logs: Array<{message: string; level: string; position: unknown}>;
};

/** Plugin type used by Bun.build(). */
type BunPlugin = {
    name: string;
};

/** Options for Bun.build(). */
type BunBuildOptions = {
    entrypoints: string[];
    compile?: {target: string; outfile: string};
    target?: string;
    packages?: string;
    conditions?: string[];
    tsconfig?: string;
    plugins?: BunPlugin[];
};

declare namespace Bun {
    function file(path: string): BunFile;
    function write(path: string, data: Uint8Array | string | Blob | number): Promise<number>;
    function build(options: BunBuildOptions): Promise<BunBuildResult>;
    const main: string;
}

// Re-apply the generic overload for `require` that src/types/global.d.ts registers in the root
// compilation. The VCR tsconfig compiles files from a different root, so the augmentation on
// NodeRequire added by global.d.ts is not always available here.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface NodeRequire {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type, @typescript-eslint/no-explicit-any
    <T = any>(id: string): T;
}
// The declare var here ensures the global `require` is typed as NodeRequire (which carries the
// generic overload above) rather than the more restricted NodeJS.Require from bun-types.
// eslint-disable-next-line no-var
declare var require: NodeRequire; // eslint-disable-line @typescript-eslint/no-deprecated

type ImportMeta = {
    /** Absolute path to the directory containing this file. */
    dir: string;
    /** Absolute path to this file. */
    path: string;
    /** Whether this is the entry-point module. */
    main: boolean;
};

type BunTestMatchers = {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toContain(expected: string): void;
    toBeLessThanOrEqual(expected: number): void;
    toThrow(expected?: string | RegExp): void;
};

declare module 'bun:test' {
    function test(label: string, fn: () => void | Promise<void>): void;
    function test(label: string, options: {timeout?: number}, fn: () => void | Promise<void>): void;
    function describe(label: string, fn: () => void): void;
    function beforeAll(fn: () => void | Promise<void>): void;
    function beforeEach(fn: () => void | Promise<void>): void;
    function afterAll(fn: () => void | Promise<void>): void;
    function afterEach(fn: () => void | Promise<void>): void;
    function expect(value: unknown): BunTestMatchers;
}
