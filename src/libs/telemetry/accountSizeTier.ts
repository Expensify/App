import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type SizeTier = ValueOf<typeof CONST.TELEMETRY.SIZE_TIER>;

// Two or three borders, so the last tier is always one of the four tier values
type Borders = readonly [number, number] | readonly [number, number, number];

// Inclusive upper bounds of small, medium and large. Anything above the last one is xlarge (or large for tags with two borders).
const BORDERS = {
    [CONST.TELEMETRY.TAGS.REPORTS_COUNT]: [25, 250, 1000],
    [CONST.TELEMETRY.TAGS.TRANSACTIONS_COUNT]: [25, 250, 1000],
    [CONST.TELEMETRY.TAGS.PERSONAL_DETAILS_COUNT]: [100, 1000],
    [CONST.TELEMETRY.TAGS.POLICIES_COUNT]: [1, 2, 10],
    [CONST.TELEMETRY.TAGS.DB_SIZE]: [5_000_000, 20_000_000, 50_000_000],
} as const satisfies Record<string, Borders>;

type AccountSizeTag = keyof typeof BORDERS;

const TIERS: SizeTier[] = [CONST.TELEMETRY.SIZE_TIER.SMALL, CONST.TELEMETRY.SIZE_TIER.MEDIUM, CONST.TELEMETRY.SIZE_TIER.LARGE, CONST.TELEMETRY.SIZE_TIER.XLARGE];

function getAccountSizeTier(tag: AccountSizeTag, value: number): SizeTier {
    const borders = BORDERS[tag];
    const index = borders.findIndex((border) => value <= border);
    return TIERS[index === -1 ? borders.length : index];
}

export default getAccountSizeTier;
