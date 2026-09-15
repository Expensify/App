import type {OptionData} from '@libs/ReportUtils';

import type {Participant} from '@src/types/onyx/IOU';

/** A row of the confirmation list. Rows are participants only — every expense field is rendered in the list footer. */
type MoneyRequestConfirmationListItem = (Participant & {keyForList: string}) | OptionData;

// eslint-disable-next-line import/prefer-default-export
export type {MoneyRequestConfirmationListItem};
