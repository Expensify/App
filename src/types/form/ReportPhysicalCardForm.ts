import type Form from './Form';

type ReportPhysicalCardForm = Form & {
    /** Whether the card was terminated without replacement */
    cardTerminatedWithoutReplacement?: boolean;
};

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export type {ReportPhysicalCardForm};
