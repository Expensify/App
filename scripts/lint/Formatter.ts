import type {FormatterResult, LintMessage} from './types';

/**
 * Port: turn the final message list into human-readable output and counts.
 */
abstract class Formatter {
    abstract readonly name: string;

    abstract format(messages: LintMessage[]): FormatterResult;
}

export default Formatter;
