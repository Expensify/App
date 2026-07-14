export type SourceLocation = {
    start: {line: number; column: number};
    end: {line: number; column: number};
};

export type CompilerError = {
    reason: string;
    severity: string;
    loc?: SourceLocation;
};

export type CompilationResult = {
    status: 'compiled' | 'failed' | 'no-components';
    memoized: boolean;
    errors: CompilerError[];
};

export function checkReactCompilerWithOxc(source: string, filename: string): CompilationResult;
export function didReactCompilerCompileFile(source: string, filename: string): boolean;
export function didOxcMemoizeFile(source: string, filename: string): boolean;
