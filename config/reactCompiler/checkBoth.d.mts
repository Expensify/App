import type {CompilationResult as BabelCompilationResult} from './checkWithBabel.d.mts';
import type {CompilationResult as OxcCompilationResult} from './checkWithOxc.d.mts';

export type DualCompilationResult = {
    babel: BabelCompilationResult;
    oxc: OxcCompilationResult;
    isDivergent: boolean;
};

export function checkBothCompilers(source: string, filename: string): DualCompilationResult;
export function didBothCompilersMemoizeFile(source: string, filename: string): boolean;
