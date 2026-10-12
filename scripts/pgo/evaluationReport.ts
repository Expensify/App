// cspell:ignore cooldown
/** Validate and summarize public numeric evaluation evidence without selecting a release binary. */
import {isDeepStrictEqual} from 'node:util';

import type {BenchmarkSample} from '../lib/benchmarkStatistics';
import type {GitHubRead} from './candidateResolve';
import type {EvaluationPlan, EvaluationPlatform} from './evaluationSchema';

import {benchmarkStats, percentile} from '../lib/benchmarkStatistics';
import {checklistMatches} from './candidateResolve';
import {candidateKey, isRecord, isSha256} from './evaluationSchema';
import {HEAVY_JOURNEY_SPAN_NAMES, JOURNEY_SPAN_NAMES} from './shared';

// The hyphenated scenario name is the persisted benchmark schema.
// eslint-disable-next-line @typescript-eslint/naming-convention
const scenarios = {startup: ['ManualAppStartup'], journey: [...JOURNEY_SPAN_NAMES], 'heavy-journey': [...HEAVY_JOURNEY_SPAN_NAMES]};
const publicToolchainKeys = [
    'compilerVersion',
    'profileToolVersion',
    'sdkVersion',
    'buildToolVersion',
    'identitySha256',
    'reviewedOverlaySha256',
    'fixtureSha256',
    'environmentSha256',
    'releasePodLockSha256',
    'instrumentedPodLockSha256',
    'optimizedPodLockSha256',
];

async function evaluationReport(plan: EvaluationPlan, inputs: unknown[], read: GitHubRead) {
    const platforms = plan.platforms.map((platform) => {
        const candidates = inputs.filter((input) => isRecord(input) && input.platform === platform);
        if (candidates.length > 1) {
            throw new Error('Duplicate platform evaluation evidence.');
        }
        const input = candidates.at(0);
        if (!input) {
            return {platform, status: 'missing' as const, cohorts: undefined};
        }
        return summarizePlatform(plan, platform, input);
    });
    const status = platforms.every((entry) => entry.status === 'passed') ? 'complete' : 'incomplete';
    const limitations = [
        'Evaluation only: canonical baseline artifacts and deployment selection are unchanged.',
        'Measurements retain every sample, including IQR outliers; summaries are descriptive, not a significance or causal benefit claim.',
        'Heavy report first layout can contain a skeleton and does not prove content readiness. Warm navigation and the heavy fixture overlap training.',
        'Device temperature, CI repeatability, store equivalence and isolated scrolling improvement are unverified.',
        'Native artifacts are local evaluation builds with the reviewed tooling overlay; the source fingerprint is not a claim of a pristine candidate checkout.',
        'Compiler configuration and binary/profile hashes alone do not establish actual profile consumption or full coverage.',
    ];
    const summary = {
        schema: 1,
        status,
        candidate: plan.candidate,
        toolingSha: plan.toolingSha,
        producerRunID: plan.producerRunID,
        producerRunAttempt: plan.producerRunAttempt,
        platforms,
        limitations,
    };
    const heading = `PGO evaluation for ${plan.candidate.version} (${plan.candidate.environment})`;
    const rows = platforms.flatMap((entry) =>
        entry.cohorts
            ? entry.cohorts.flatMap((cohort) =>
                  cohort.statistics.map(
                      (metric) =>
                          `| ${entry.platform} | ${cohort.scenario} | ${cohort.order} | ${metric.span} | ${metric.release.average.toFixed(2)} | ${metric.optimized.average.toFixed(2)} | ${metric.meanEffectPercent?.toFixed(2) ?? 'N/A'}% |`,
                  ),
              )
            : [`| ${entry.platform} | ${entry.status} | — | — | — | — | — |`],
    );
    const markdown = [
        heading,
        '',
        `Candidate App: ${plan.candidate.appSha}; Mobile: ${plan.candidate.mobileSha}. Tooling: ${plan.toolingSha}.`,
        '',
        `Evidence status: ${status}. Positive effects mean (baseline − optimized) / baseline × 100.`,
        '',
        '| Platform | Workload | Order | Span | Baseline mean ms | Optimized mean ms | Effect |',
        '| --- | --- | --- | --- | ---: | ---: | ---: |',
        ...rows,
        '',
        'The attached JSON contains all sanitized raw samples, mean, median, p10/p90, min/max, quartiles, IQR outlier counts and provenance. Both orders are reported separately.',
        '',
        ...limitations.map((text) => `- ${text}`),
        '',
    ].join('\n');
    let targetIssueNumber: number | null = null;
    if (plan.checklistIssueNumber !== null) {
        const issue = await read(`/repos/Expensify/App/issues/${plan.checklistIssueNumber}`);
        if (checklistMatches(issue, plan.candidate.version)) {
            targetIssueNumber = plan.checklistIssueNumber;
        }
    }
    const marker = `<!-- pgo-evaluation:v1:${plan.candidate.version}:${candidateKey(plan.candidate)} -->`;
    const runLink = process.env.GITHUB_RUN_ID ? `https://github.com/Expensify/App/actions/runs/${process.env.GITHUB_RUN_ID}` : 'Workflow run link unavailable.';
    const body = `Chris's AI co-pilot reporting the CI evaluation. 🤖\n\n${marker}\n${markdown}\nEvaluation run: ${runLink}\n`;
    if (body.length > 32000) {
        throw new Error('Evaluation comment exceeds the bounded report size.');
    }
    return {
        summary,
        markdown,
        comment: {
            marker,
            body,
            targetIssueNumber,
            version: plan.candidate.version,
            skippedReason: targetIssueNumber === null ? 'No exact historical deployment checklist matches this candidate.' : null,
        },
    };
}

function summarizePlatform(plan: EvaluationPlan, platform: EvaluationPlatform, input: unknown) {
    if (!isRecord(input) || input.schema !== 1 || input.platform !== platform || !isDeepStrictEqual(input.candidate, plan.candidate) || input.toolingSha !== plan.toolingSha) {
        throw new Error('Platform result differs from the exact evaluation candidate.');
    }
    if (input.status === 'failed') {
        const stages = [
            'candidate-guard',
            'account-preflight',
            'build-release',
            'build-instrumented',
            'verify-instrumented',
            'install-instrumented',
            'training',
            'validate-training',
            'build-optimized',
            ...['startup', 'journey', 'heavy-journey'].flatMap((scenario) => ['release-first', 'optimized-first'].map((order) => `${scenario}-${order}`)),
        ];
        if (input.failureStage !== undefined && (typeof input.failureStage !== 'string' || !stages.includes(input.failureStage))) {
            throw new Error('Invalid categorical failure stage.');
        }
        return {platform, status: 'failed' as const, failureStage: input.failureStage};
    }
    if (
        input.status !== 'passed' ||
        !isRecord(input.artifactSha256) ||
        !['release', 'instrumented', 'optimized'].every((kind) => isSha256(input.artifactSha256 && isRecord(input.artifactSha256) ? input.artifactSha256[kind] : undefined)) ||
        !isSha256(input.profileSha256) ||
        !isSha256(input.sourceIdentity) ||
        !isRecord(input.toolchain) ||
        !Array.isArray(input.cohorts) ||
        input.cohorts.length !== 6 ||
        !['verified', 'unverified'].includes(String(input.compilerConsumption))
    ) {
        throw new Error('Incomplete platform provenance.');
    }
    const toolchain = Object.fromEntries(
        publicToolchainKeys.flatMap((key) => {
            const value = isRecord(input.toolchain) ? input.toolchain[key] : undefined;
            if (value === undefined) {
                return [];
            }
            if (typeof value !== 'string' || value.length > 2000 || (key.endsWith('Sha256') ? !isSha256(value) : !/^[\w .():,+#-]+$/.test(value))) {
                throw new Error('Toolchain field is not a public version or digest.');
            }
            return [[key, value]];
        }),
    );
    const cohorts = input.cohorts.map(summarizeCohort);
    for (const scenario of Object.keys(scenarios)) {
        const orders = cohorts
            .filter((cohort) => cohort.scenario === scenario)
            .map((cohort) => cohort.order)
            .sort();
        if (!isDeepStrictEqual(orders, ['optimized-first', 'release-first'])) {
            throw new Error('Expected complete opposite orders for each workload.');
        }
    }
    return {
        platform,
        status: 'passed' as const,
        artifactSha256: {release: String(input.artifactSha256.release), instrumented: String(input.artifactSha256.instrumented), optimized: String(input.artifactSha256.optimized)},
        profileSha256: input.profileSha256,
        sourceIdentity: input.sourceIdentity,
        toolchain,
        compilerConsumption: input.compilerConsumption,
        cohorts,
    };
}

function summarizeCohort(input: unknown) {
    if (
        !isRecord(input) ||
        (input.scenario !== 'startup' && input.scenario !== 'journey' && input.scenario !== 'heavy-journey') ||
        !['release-first', 'optimized-first'].includes(String(input.order)) ||
        input.runs !== 20 ||
        input.warmUpRunsPerBinary !== 1 ||
        input.cooldownSecondsPerBinary !== 5 ||
        !isSha256(input.releaseCsvSha256) ||
        !isSha256(input.optimizedCsvSha256)
    ) {
        throw new Error('Invalid evaluation cohort metadata.');
    }
    const scenario = input.scenario;
    const spans = scenarios[scenario];
    if (!isDeepStrictEqual(input.spans, spans)) {
        throw new Error('Unexpected evaluation spans.');
    }
    const release = numericSamples(input.release, spans);
    const optimized = numericSamples(input.optimized, spans);
    const statistics = spans.map((span) => {
        const baseline = distribution(release.filter((sample) => sample.span === span).map((sample) => sample.durationMs));
        const pgo = distribution(optimized.filter((sample) => sample.span === span).map((sample) => sample.durationMs));
        return {span, release: baseline, optimized: pgo, meanEffectPercent: baseline.average > 0 ? (100 * (baseline.average - pgo.average)) / baseline.average : null};
    });
    return {
        scenario,
        order: String(input.order),
        runs: 20,
        warmUpRunsPerBinary: 1,
        cooldownSecondsPerBinary: 5,
        releaseCsvSha256: input.releaseCsvSha256,
        optimizedCsvSha256: input.optimizedCsvSha256,
        release,
        optimized,
        statistics,
        frames: frameCoverage(input.frames),
    };
}

function numericSamples(input: unknown, spans: readonly string[]): BenchmarkSample[] {
    if (!Array.isArray(input) || input.length !== 20 * spans.length) {
        throw new Error('Incomplete or extra timing samples.');
    }
    const samples = input.map((sample: unknown) => {
        if (
            !isRecord(sample) ||
            !Number.isSafeInteger(sample.run) ||
            typeof sample.span !== 'string' ||
            !spans.includes(sample.span) ||
            typeof sample.durationMs !== 'number' ||
            !Number.isFinite(sample.durationMs) ||
            sample.durationMs < 0
        ) {
            throw new Error('Invalid timing sample.');
        }
        return {run: Number(sample.run), span: sample.span, durationMs: sample.durationMs};
    });
    for (const span of spans) {
        if (
            !isDeepStrictEqual(
                samples.filter((sample) => sample.span === span).map((sample) => sample.run),
                Array.from({length: 20}, (_, index) => index + 1),
            )
        ) {
            throw new Error('Timing samples must be exactly ordered 1 through 20.');
        }
    }
    return samples;
}

function frameCoverage(input: unknown) {
    if (input === undefined) {
        return {status: 'unverified' as const};
    }
    if (!isRecord(input)) {
        throw new Error('Invalid numeric frame coverage.');
    }
    return {
        status: 'recorded' as const,
        release: summarizeFrames(input.release),
        optimized: summarizeFrames(input.optimized),
        meaning: 'Native janky frames, not FPS or literal dropped frames; variable automation window and reset isolation are unverified.',
    };
}

function summarizeFrames(input: unknown) {
    if (!Array.isArray(input) || input.length !== 20) {
        throw new Error('Frame coverage must record every measured run.');
    }
    const samples = input.map((sample: unknown, index) => {
        if (!isRecord(sample) || sample.run !== index + 1) {
            throw new Error('Frame coverage is not ordered.');
        }
        if (sample.status === 'unavailable') {
            return {run: index + 1, status: 'unavailable' as const};
        }
        const {totalFrames, jankyFrames, originalPercent, sampleWindowMs} = sample;
        if (
            sample.status !== 'available' ||
            typeof totalFrames !== 'number' ||
            typeof jankyFrames !== 'number' ||
            typeof originalPercent !== 'number' ||
            typeof sampleWindowMs !== 'number' ||
            ![totalFrames, jankyFrames, originalPercent, sampleWindowMs].every(Number.isFinite) ||
            !Number.isInteger(totalFrames) ||
            !Number.isInteger(jankyFrames) ||
            totalFrames <= 0 ||
            jankyFrames < 0 ||
            jankyFrames > totalFrames ||
            originalPercent < 0 ||
            originalPercent > 100 ||
            sampleWindowMs <= 0
        ) {
            throw new Error('Invalid available native frame sample.');
        }
        return {run: index + 1, status: 'available' as const, totalFrames, jankyFrames, originalPercent, sampleWindowMs};
    });
    const available = samples.filter((sample) => sample.status === 'available');
    const sumTotalFrames = available.reduce((total, sample) => total + sample.totalFrames, 0);
    const sumJankyFrames = available.reduce((total, sample) => total + sample.jankyFrames, 0);
    return {
        requestedSamples: 20,
        availableSamples: available.length,
        unavailableSamples: 20 - available.length,
        samples,
        summary: available.length
            ? {
                  sumTotalFrames,
                  sumJankyFrames,
                  weightedJankyPercent: (100 * sumJankyFrames) / sumTotalFrames,
                  originalPercent: distribution(available.map((sample) => sample.originalPercent)),
                  sampleWindowMs: distribution(available.map((sample) => sample.sampleWindowMs)),
              }
            : null,
    };
}

function distribution(values: readonly number[]) {
    const stats = benchmarkStats(values);
    const q1 = percentile(values, 0.25);
    const q3 = stats.p75;
    const iqr = q3 - q1;
    return {...stats, median: stats.p50, p10: percentile(values, 0.1), q1, q3, iqr, iqrOutliers: values.filter((value) => value < q1 - 1.5 * iqr || value > q3 + 1.5 * iqr).length};
}

export {frameCoverage, summarizeFrames, distribution, evaluationReport, numericSamples, summarizeCohort, summarizePlatform};
