import type {ReportsToDisplayInLHN} from '@hooks/useSidebarOrderedReports';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

// Fixed seed: the perf gate times main and the PR on this same data, so it must not change between processes.
const SEED = 3217;

const PINNED_SHARE = 0.05;

// Room numbers repeat every 500 reports, so many rooms share a name and the sort has real ties to break.
const ROOM_NUMBER_RANGE = 500;

// Last activity is spread over roughly the past 300 days, like a long-lived account.
const ACTIVITY_SPREAD_MS = 300 * 24 * 60 * 60 * 1000;

// Shared by the Jest and the engine benchmark so both take the same number of samples.
const SIDEBAR_SORT_RUNS = 20;
const SIDEBAR_SORT_WARMUP_RUNS = 3;

const ASCII_FIRST_NAMES = [
    'Adam',
    'Alice',
    'Bob',
    'Carol',
    'Daniel',
    'Emma',
    'Frank',
    'Grace',
    'Henry',
    'Ivy',
    'Jack',
    'Kate',
    'Liam',
    'Mia',
    'Noah',
    'Olivia',
    'Paul',
    'Rose',
    'Sam',
    'Zoe',
];
const ASCII_LAST_NAMES = ['Brown', 'Clark', 'Davis', 'Evans', 'Green', 'Harris', 'Jones', 'King', 'Lewis', 'Miller', 'Moore', 'Smith', 'Taylor', 'Walker', 'White', 'Young'];
// cspell:disable-next-line
const ACCENTED_FIRST_NAMES = ['José', 'Zoë', 'Ñuño', 'Łukasz', 'Søren', 'André', 'Chloé', 'Inês', 'Jürgen', 'Mikuláš', 'Renée', 'Çağla', 'Dorotéa', 'Élodie', 'Ömer', 'Íñigo'];
// cspell:disable-next-line
const ACCENTED_LAST_NAMES = ['Müller', 'Gonçalves', 'Peña', 'Dvořák', 'Nuñez', 'Lindström', 'Kovač', 'Brontë', 'Śliwa', 'Østergaard', 'García', 'Žukauskas'];
const ROOM_PREFIXES = ['Budget', 'Report', 'Expenses', 'Trip', 'Team'];

type Dataset = {
    reportsToDisplay: ReportsToDisplayInLHN;
};

const PRNG_MODULUS = 2147483647;
const PRNG_MULTIPLIER = 48271;

/** Small seeded PRNG (Park-Miller) so every run builds identical data. Products stay below 2^53, so the math is exact. */
function createRandom(seed: number): () => number {
    let state = seed % PRNG_MODULUS || 1;
    return () => {
        state = (state * PRNG_MULTIPLIER) % PRNG_MODULUS;
        return (state - 1) / (PRNG_MODULUS - 1);
    };
}

function pick<T>(random: () => number, items: readonly T[]): T {
    return items[Math.floor(random() * items.length)];
}

function buildName(random: () => number, isAccented: boolean, index: number): string {
    // About 1 in 5 names is a numbered room, which exercises the numeric zero-padding in the sort key.
    if (random() < 0.2) {
        return `${pick(random, ROOM_PREFIXES)} ${index % ROOM_NUMBER_RANGE}`;
    }
    if (!isAccented) {
        return `${pick(random, ASCII_FIRST_NAMES)} ${pick(random, ASCII_LAST_NAMES)}`;
    }
    // Mix accented and plain parts, like real accounts, so an accented and a plain spelling of one name tie on the sort key.
    const firstName = random() < 0.7 ? pick(random, ACCENTED_FIRST_NAMES) : pick(random, ASCII_FIRST_NAMES);
    const lastName = random() < 0.7 ? pick(random, ACCENTED_LAST_NAMES) : pick(random, ASCII_LAST_NAMES);
    return `${firstName} ${lastName}`;
}

function buildSidebarSortDataset(reportsCount: number, accentedShare: number): Dataset {
    const random = createRandom(SEED + reportsCount);
    const startTime = Date.UTC(2026, 0, 1);
    const reportsToDisplay: ReportsToDisplayInLHN = {};

    for (let index = 0; index < reportsCount; index++) {
        const reportID = String(index + 1);
        reportsToDisplay[reportID] = {
            reportID,
            type: CONST.REPORT.TYPE.CHAT,
            reportName: buildName(random, random() < accentedShare, index),
            isPinned: random() < PINNED_SHARE,
            lastVisibleActionCreated: new Date(startTime + Math.floor(random() * ACTIVITY_SPREAD_MS)).toISOString().replace('T', ' ').replace('Z', ''),
        };
    }

    return {reportsToDisplay};
}

const SIDEBAR_SORT_REPORT_COUNTS = [1000, 15000];
const SIDEBAR_SORT_ACCENTED_SHARES = [0, 0.3];
const SIDEBAR_SORT_PRIORITY_MODES: Array<{label: string; mode: ValueOf<typeof CONST.PRIORITY_MODE>}> = [
    {label: 'default', mode: CONST.PRIORITY_MODE.DEFAULT},
    {label: 'focus', mode: CONST.PRIORITY_MODE.GSD},
];

/** One name per scenario, shared by the Jest benchmark and the engine comparison so their results line up. */
function getSidebarSortBenchmarkName(reportsCount: number, accentedShare: number, modeLabel: string): string {
    return `[SidebarUtils] sortReportsToDisplayInLHN ${reportsCount} reports, ${accentedShare * 100}% accented, ${modeLabel} mode`;
}

export {
    buildSidebarSortDataset,
    getSidebarSortBenchmarkName,
    SIDEBAR_SORT_ACCENTED_SHARES,
    SIDEBAR_SORT_PRIORITY_MODES,
    SIDEBAR_SORT_REPORT_COUNTS,
    SIDEBAR_SORT_RUNS,
    SIDEBAR_SORT_WARMUP_RUNS,
};
