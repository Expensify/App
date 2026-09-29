import type {CompilationResult as BabelCompilationResult} from './checkWithBabel.d.mts';
import type {CompilationResult as OxcCompilationResult} from './checkWithOxc.d.mts';

type DualCompilationResult = {
    babel: BabelCompilationResult;
    oxc: OxcCompilationResult;
    isDivergent: boolean;
};

declare function checkBothCompilers(source: string, filename: string): DualCompilationResult;
declare function didBothCompilersMemoizeFile(source: string, filename: string): boolean;

export {checkBothCompilers, didBothCompilersMemoizeFile};
