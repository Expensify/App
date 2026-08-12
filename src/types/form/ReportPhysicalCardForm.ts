import type Form from './Form';

type ReportPhysicalCardForm = Form & {
    /** Whether the card was terminated without replacement */
    cardTerminatedWithoutReplacement?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {ReportPhysicalCardForm};
