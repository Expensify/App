/*
 * Runtime validation for Bun.build compile --target strings.
 *
 * CompileTarget is a large template union in @types/bun; this list is checked with
 * `satisfies` so additions stay aligned with Bun.Build.CompileTarget at compile time.
 */
const BUN_COMPILE_TARGETS = [
    'bun-darwin-x64',
    'bun-darwin-x64-baseline',
    'bun-darwin-x64-modern',
    'bun-darwin-arm64',
    'bun-darwin-arm64-baseline',
    'bun-darwin-arm64-modern',
    'bun-darwin-aarch64',
    'bun-darwin-aarch64-baseline',
    'bun-darwin-aarch64-modern',
    'bun-linux-x64',
    'bun-linux-x64-baseline',
    'bun-linux-x64-modern',
    'bun-linux-x64-glibc',
    'bun-linux-x64-musl',
    'bun-linux-arm64',
    'bun-linux-arm64-baseline',
    'bun-linux-arm64-modern',
    'bun-linux-arm64-glibc',
    'bun-linux-arm64-musl',
    'bun-linux-aarch64',
    'bun-linux-aarch64-musl',
    'bun-linux-x64-baseline-glibc',
    'bun-linux-x64-modern-glibc',
    'bun-linux-x64-baseline-musl',
    'bun-linux-x64-modern-musl',
    'bun-linux-arm64-baseline-musl',
    'bun-linux-arm64-modern-musl',
    'bun-windows-x64',
    'bun-windows-x64-baseline',
    'bun-windows-x64-modern',
    'bun-windows-arm64',
] as const satisfies readonly Bun.Build.CompileTarget[];

const BUN_COMPILE_TARGET_SET: ReadonlySet<string> = new Set(BUN_COMPILE_TARGETS);

function isCompileTarget(value: string): value is Bun.Build.CompileTarget {
    return BUN_COMPILE_TARGET_SET.has(value);
}

function parseCompileTarget(value: string): Bun.Build.CompileTarget {
    if (isCompileTarget(value)) {
        return value;
    }

    throw new Error(`Invalid compile target "${value}". Expected one of: ${BUN_COMPILE_TARGETS.join(', ')}`);
}

export default parseCompileTarget;
