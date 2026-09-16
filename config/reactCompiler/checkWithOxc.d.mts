type SourceLocation = {
    start: {line: number; column: number};
    end: {line: number; column: number};
};

type CompilerError = {
    reason: string;
    severity: string;
    loc?: SourceLocation;
};

type CompilationResult = {
    status: 'compiled' | 'failed' | 'no-components';
    memoized: boolean;
    errors: CompilerError[];
};

declare function checkReactCompilerWithOxc(source: string, filename: string): CompilationResult;

export type {CompilationResult};
export default checkReactCompilerWithOxc;
