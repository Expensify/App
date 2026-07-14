export type SourceLocation = {
    start: {line: number; column: number};
    end: {line: number; column: number};
};

export type CompilerError = {
    reason: string;
    severity: string;
    loc?: SourceLocation;
    fnLoc?: SourceLocation;
};

export type CompilationResult = {
    status: 'compiled' | 'failed' | 'no-components';
    memoized: boolean;
    errors: CompilerError[];
};

export function checkReactCompilerWithBabel(source: string, filename: string): CompilationResult;
export function didReactCompilerCompileFile(source: string, filename: string): boolean;
export function didBabelMemoizeFile(source: string, filename: string): boolean;
