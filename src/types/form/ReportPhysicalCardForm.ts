import type Form from './Form';

type ReportPhysicalCardForm = Form & {
    cardTerminatedWithoutReplacement?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {ReportPhysicalCardForm};
