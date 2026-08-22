import {file} from 'bun';

import type {LintFileResult, LintMessage, RawLintOutput, SeatbeltOptions} from './types';

import {filterReactCompilerMessages} from './reactCompilerFilter';
import renderReport from './report';
import {applySeatbelt} from './seatbelt';
import {stratifyNoDeprecated} from './stratifyNoDeprecated';
import Timings from './timings';

type PipelineInput = {
    raw: RawLintOutput;
    options: SeatbeltOptions;
    showWarnings: boolean;
    timings?: Timings;
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
    const timings = input.timings ?? new Timings();
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

    messages = await timings.measure('react-compiler-filter', () => filterReactCompilerMessages(messages, options.projectRoot));
    messages = await timings.measure('stratify-no-deprecated', () => stratifyNoDeprecated(messages));

    const seatbeltResult = await timings.measure('seatbelt', () => applySeatbelt(messages, options, lintedFilenames(raw.results)));
    messages = seatbeltResult.messages;

    const report = timings.measureSync('report', () => renderReport(messages, {projectRoot: options.projectRoot, showWarnings}));
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

function isRawLintOutput(value: unknown): value is RawLintOutput {
    return typeof value === 'object' && value !== null && 'results' in value && 'linterExitCode' in value;
}

async function loadRawFromFile(path: string): Promise<RawLintOutput> {
    const parsed: unknown = JSON.parse(await file(path).text());
    if (!isRawLintOutput(parsed)) {
        throw new Error(`Invalid raw lint dump: ${path}`);
    }
    return parsed;
}

async function dumpRawToFile(path: string, raw: RawLintOutput): Promise<void> {
    await Bun.write(path, `${JSON.stringify(raw)}\n`);
}

export {dumpRawToFile, loadRawFromFile, runPostprocess};
export type {PipelineInput, PipelineResult};
