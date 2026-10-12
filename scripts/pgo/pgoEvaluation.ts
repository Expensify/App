#!/usr/bin/env bun
/** Evaluation-only CLI: native execution and hosted public reporting are separate operations. */
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {basename, join} from 'node:path';
import {parseArgs} from 'node:util';

import {findFiles} from '../lib/scriptUtils';
import {evaluationReport} from './evaluationReport';
import {parsePlan} from './evaluationSchema';
import {createGitHubReader} from './pgoCandidate';

async function main(): Promise<void> {
    const {values, positionals} = parseArgs({allowPositionals: true, options: {plan: {type: 'string'}, output: {type: 'string'}, results: {type: 'string'}}});
    if (!values.plan || !values.output) {
        throw new Error('Explicit plan and output paths are required.');
    }
    const plan = parsePlan(JSON.parse(readFileSync(values.plan, 'utf8')));
    mkdirSync(values.output, {recursive: true});
    if (positionals.at(0) === 'execute') {
        const platform = positionals.at(1);
        if ((platform !== 'android' && platform !== 'ios') || !plan.platforms.includes(platform)) {
            throw new Error('Platform is not eligible for this immutable plan.');
        }
        const {executeEvaluation} = await import('./evaluationRun');
        await executeEvaluation(plan, platform, values.output);
        return;
    }
    if (positionals.at(0) !== 'report' || !values.results) {
        throw new Error('Expected execute or report with explicit results.');
    }
    const files = findFiles(values.results, '.json').filter((path) => /^evaluation-(android|ios)\.json$/.test(basename(path)));
    const report = await evaluationReport(
        plan,
        files.map((path) => JSON.parse(readFileSync(path, 'utf8')) as unknown),
        createGitHubReader(),
    );
    writeFileSync(join(values.output, 'summary.json'), `${JSON.stringify(report.summary, null, 2)}\n`);
    writeFileSync(join(values.output, 'summary.md'), report.markdown);
    writeFileSync(join(values.output, 'comment.json'), `${JSON.stringify(report.comment, null, 2)}\n`);
}

if (import.meta.main) {
    await main();
}
export default main;
