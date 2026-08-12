import type IndicatorStatus from '@src/types/utils/IndicatorStatus';

type IndicatorTestCase = {
    name: string;
    indicatorColor: string;
    status: IndicatorStatus | undefined;
    indicatorPolicyID?: string;
};

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export type {IndicatorTestCase};
