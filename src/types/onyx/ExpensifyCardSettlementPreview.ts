import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors} from './OnyxCommon';

/** The settlement an admin is about to confirm, computed by the backend when they move past the amount page */
type ExpensifyCardSettlementPreview = {
    /** Whether the admin chose to settle the full balance or a partial amount */
    settlementType?: ValueOf<typeof CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE>;

    /** The amount the admin entered, in cents */
    requestedAmount?: number;

    /** The amount that will actually be billed, in cents, rounded up to whole transactions */
    roundedAmount?: number;

    /** The most that can be settled early, in cents */
    maximumAmount?: number;

    /** How many transactions the rounded amount covers */
    transactionCount?: number;

    /** Whether the entered amount is above the maximum */
    isAboveMaximum?: boolean;

    /** Whether the rounded amount settles everything outstanding */
    isEverythingEligible?: boolean;

    /** Whether the backend is still computing the preview */
    isLoading?: boolean;

    /** Errors from the last preview request */
    errors?: Errors;
};

export default ExpensifyCardSettlementPreview;
