import type {LintMessage, ProcessorContext} from './types';

/**
 * Port: transform a message list. A processor may rewrite, drop, or demote
 * messages, and may perform side effects (e.g. writing a baseline file).
 */
abstract class Processor {
    abstract readonly name: string;

    abstract process(messages: LintMessage[], context: ProcessorContext): Promise<LintMessage[]>;
}

export default Processor;
