import type {LinterResult} from './types';

/**
 * Port: produce diagnostics for a set of paths. Implementations may spawn a
 * CLI, call a library, or return a fixture — the pipeline only sees LinterResult.
 */
abstract class Linter {
    abstract readonly name: string;

    abstract run(targets: string[]): Promise<LinterResult>;
}

export default Linter;
