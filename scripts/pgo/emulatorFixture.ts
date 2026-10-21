import {isRecord} from '@libs/ObjectUtils';

const VERIFICATION_SCREENS = ['Inbox', 'Report', 'Expenses', 'Search', 'Inbox'] as const;
const VERIFICATION_ROW_COUNT = 240;
const VERIFICATION_MARKER = 'pgo-ci-workload.json';
type VerificationMarker = {schema: 1; status: 'passed'; workload: 'synthetic'; screens: number; rows: number; durationMs: number};

function parseVerificationMarker(input: unknown): VerificationMarker {
    if (
        !isRecord(input) ||
        input.schema !== 1 ||
        input.status !== 'passed' ||
        input.workload !== 'synthetic' ||
        input.screens !== VERIFICATION_SCREENS.length ||
        input.rows !== VERIFICATION_ROW_COUNT ||
        typeof input.durationMs !== 'number' ||
        !Number.isFinite(input.durationMs) ||
        input.durationMs <= 0
    ) {
        throw new Error('The emulator workload did not complete every synthetic screen.');
    }
    return {schema: 1, status: 'passed', workload: 'synthetic', screens: input.screens, rows: input.rows, durationMs: input.durationMs};
}

function verificationRows(screen: number) {
    return Array.from({length: VERIFICATION_ROW_COUNT}, (_, index) => ({
        id: index + 1,
        title: `CI report ${index + 1}`,
        amount: ((index * 173 + screen * 31) % 10000) / 100,
    })).sort((a, b) => (screen % 2 === 0 ? a.id - b.id : b.amount - a.amount));
}

export {parseVerificationMarker, verificationRows, VERIFICATION_MARKER, VERIFICATION_ROW_COUNT, VERIFICATION_SCREENS};
export type {VerificationMarker};
