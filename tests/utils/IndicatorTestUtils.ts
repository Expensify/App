import type IndicatorStatus from '@src/types/utils/IndicatorStatus';

type IndicatorTestCase = {
    name: string;
    indicatorColor: string;
    status: IndicatorStatus | undefined;
    policyIDWithErrors?: string;
};

// eslint-disable-next-line import/prefer-default-export
export type {IndicatorTestCase};
