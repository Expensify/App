import type Formatter from './Formatter';
import type Linter from './Linter';
import type Processor from './Processor';
import type {LintMessage} from './types';

import Bench from '../utils/Bench';

type PipelineResult = {
    messages: LintMessage[];
    errorCount: number;
    warningCount: number;
    reportText: string;
    exitCode: number;
};

/**
 * Application service: run a Linter, then each Processor in order, then a Formatter.
 * Fatal linter exits (`exitCode > 1`) skip processors and surface stderr as the report.
 */
class Pipeline {
    constructor(
        private readonly projectRoot: string,
        private readonly linter: Linter,
        private readonly processors: readonly Processor[],
        private readonly formatter: Formatter,
        private readonly bench = new Bench(),
    ) {}

    async run(targets: string[]): Promise<PipelineResult> {
        const linterResult = await this.bench.measure(this.linter.name, () => this.linter.run(targets));

        if (linterResult.exitCode > 1) {
            return {
                messages: [],
                errorCount: 0,
                warningCount: 0,
                reportText: linterResult.stderr.trim(),
                exitCode: linterResult.exitCode,
            };
        }

        let messages = linterResult.files.flatMap((file) => file.messages);
        const context = {
            projectRoot: this.projectRoot,
            lintedFiles: linterResult.files.map((file) => file.filePath),
        };

        for (const processor of this.processors) {
            const incoming = messages;
            messages = await this.bench.measure(processor.name, () => processor.process(incoming, context));
        }

        const report = this.bench.measureSync(this.formatter.name, () => this.formatter.format(messages));
        return {
            messages,
            errorCount: report.errorCount,
            warningCount: report.warningCount,
            reportText: report.text,
            exitCode: report.errorCount > 0 ? 1 : 0,
        };
    }
}

export default Pipeline;
export type {PipelineResult};
