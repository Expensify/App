import type {IndicatorStatus} from '@hooks/useNavigationTabBarIndicatorChecks';

type IndicatorTestCase = {
    name: string;
    indicatorColor: string;
    status: IndicatorStatus | undefined;
    policyIDWithErrors?: string;
};

// eslint-disable-next-line import/prefer-default-export
export type {IndicatorTestCase};
