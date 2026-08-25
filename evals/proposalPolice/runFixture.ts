import {PROPOSAL_POLICE_MODEL} from '@github/actions/javascript/proposalPoliceComment/proposalPoliceComment';

import OpenAIUtils from '@scripts/utils/OpenAIUtils';

/**
 * How many times each fixture is replayed. The model is free to vary between runs, so a single sample
 * would make these evals flaky enough to be ignored, which is worse than not having them.
 */
const RUNS_PER_FIXTURE = 3;

/**
 * These evals hit the real API and are never run in CI, so the only way to reach them is deliberately.
 * A skip would look like a pass and quietly stop guarding anything.
 */
function getOpenAI(): OpenAIUtils {
    const apiKey = process.env.PROPOSAL_POLICE_API_KEY;
    if (!apiKey) {
        throw new Error('PROPOSAL_POLICE_API_KEY is not set. These evals call the real OpenAI API — export the key before running them.');
    }
    return new OpenAIUtils(apiKey);
}

/**
 * Replay one fixture `RUNS_PER_FIXTURE` times and return every result, so the caller can judge the
 * majority rather than a single sample.
 */
async function sampleFixture<T>(run: (openAI: OpenAIUtils) => Promise<T>): Promise<T[]> {
    const openAI = getOpenAI();
    const results: T[] = [];
    for (let attempt = 0; attempt < RUNS_PER_FIXTURE; attempt++) {
        // eslint-disable-next-line no-await-in-loop -- deliberately serial: these are billed API calls, and a burst of them per fixture across the whole suite invites rate limiting
        results.push(await run(openAI));
    }
    return results;
}

/**
 * The value returned by more of the samples than any other, and how many samples agreed on it.
 */
function majority<T>(samples: T[]): {value: T | undefined; agreed: number} {
    const counts = new Map<T, number>();
    for (const sample of samples) {
        counts.set(sample, (counts.get(sample) ?? 0) + 1);
    }
    const winner = [...counts.entries()].sort(([, a], [, b]) => b - a).at(0);
    if (!winner) {
        return {value: undefined, agreed: 0};
    }
    const [value, agreed] = winner;
    return {value, agreed};
}

/**
 * The middle sample, used for scores rather than labels. Fixtures assert which side of the withdrawal
 * threshold a score lands on, never an exact number, since only the side changes what the bot does.
 */
function median(samples: number[]): number {
    const sorted = [...samples].sort((a, b) => a - b);
    return sorted.at(Math.floor(sorted.length / 2)) ?? 0;
}

export {RUNS_PER_FIXTURE, PROPOSAL_POLICE_MODEL, sampleFixture, majority, median};
