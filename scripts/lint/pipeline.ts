import type {LintFileResult, LintMessage, RawLintOutput, SeatbeltOptions} from './types';

import Bench from '../utils/Bench';
import {filterReactCompilerMessages} from './reactCompilerFilter';
import renderReport from './report';
import {applySeatbelt} from './seatbelt';
import {stratifyNoDeprecated} from './stratifyNoDeprecated';

type PipelineInput = {
    raw: RawLintOutput;
    options: SeatbeltOptions;
    showWarnings: boolean;
    bench?: Bench;
};

type PipelineResult = {
    messages: LintMessage[];
    errorCount: number;
    warningCount: number;
    reportText: string;
    tsv: string;
    wroteTsv: boolean;
    exitCode: number;
};

function lintedFilenames(results: LintFileResult[]): string[] {
    return results.map((result) => result.filePath);
}

function flatten(results: LintFileResult[]): LintMessage[] {
    return results.flatMap((result) => result.messages);
}

async function runPostprocess(input: PipelineInput): Promise<PipelineResult> {
    const bench = input.bench ?? new Bench();
    const {raw, options, showWarnings} = input;

    if (raw.linterExitCode > 1) {
        return {
            messages: [],
            errorCount: 0,
            warningCount: 0,
            reportText: raw.stderr.trim(),
            tsv: '',
            wroteTsv: false,
            exitCode: raw.linterExitCode,
        };
    }

    let messages = flatten(raw.results);

    messages = await bench.measure('react-compiler-filter', () => filterReactCompilerMessages(messages, options.projectRoot));
    messages = await bench.measure('stratify-no-deprecated', () => stratifyNoDeprecated(messages));

    const seatbeltResult = await bench.measure('seatbelt', () => applySeatbelt(messages, options, lintedFilenames(raw.results)));
    messages = seatbeltResult.messages;

    const report = bench.measureSync('report', () => renderReport(messages, {projectRoot: options.projectRoot, showWarnings}));
    const exitCode = report.errorCount > 0 ? 1 : 0;

    return {
        messages,
        errorCount: report.errorCount,
        warningCount: report.warningCount,
        reportText: report.text,
        tsv: seatbeltResult.tsv,
        wroteTsv: seatbeltResult.wrote,
        exitCode,
    };
}

export {runPostprocess};
export type {PipelineInput, PipelineResult};
