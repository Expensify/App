import {render, screen} from '@testing-library/react-native';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import SplitExpenseEditPage from '@pages/iou/SplitExpenseEditPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

import React from 'react';

import createMock from '../utils/createMock';

const mockUseOnyx = jest.fn<unknown[], [string]>();

jest.mock(
    '@components/BlockingViews/FullPageNotFoundView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Button', () => jest.fn(() => null));
jest.mock(
    '@components/FixedFooter',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/HighlightableMenuItemWithTopDescription', () => jest.fn(() => null));
jest.mock('@components/MenuItemWithTopDescription', () => {
    const React2 = jest.requireActual<typeof React>('react');
    return ({description, title}: {description?: string; title?: string}) => React2.createElement('Text', {testID: `menu-item-${description}`}, title);
});
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Search/SearchContext', () => ({useSearchResultsContext: () => ({currentSearchResults: undefined})}));

jest.mock('@hooks/useAllTransactions', () => jest.fn(() => ({})));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({convertToDisplayString: String, getCurrencySymbol: () => '$'})}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, login: 'test@example.com'})));
jest.mock('@hooks/useEnvironment', () => jest.fn(() => ({isProduction: false})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        toLocaleDigit: (value: string) => value,
    })),
);
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: (key: string) => mockUseOnyx(key)}));
jest.mock('@hooks/usePersonalPolicy', () => jest.fn(() => undefined));
jest.mock('@hooks/usePolicyForMovingExpenses', () => jest.fn(() => ({policyForMovingExpenses: undefined, shouldSelectPolicy: false, shouldNavigateToUpgradePath: false})));
jest.mock('@hooks/useReportAttributes', () => jest.fn(() => ({})));
jest.mock('@hooks/useReportOrReportDraft', () => jest.fn(() => ({reportID: 'report1'})));
jest.mock('@hooks/useSplitEffectivePolicy', () => jest.fn(() => undefined));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));

jest.mock('@libs/actions/IOU/SplitExpenseItems', () => ({initDraftSplitExpenseDataForEdit: jest.fn(), removeSplitExpenseField: jest.fn(), updateSplitExpenseField: jest.fn()}));
jest.mock('@libs/actions/Policy/Category', () => ({openPolicyCategoriesPage: jest.fn()}));
jest.mock('@libs/actions/Policy/Tag', () => ({openPolicyTagsPage: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn(), getActiveRoute: jest.fn(() => '')}));
jest.mock('@libs/ReportSecondaryActionUtils', () => ({isSplitAction: () => true}));

describe('SplitExpenseEditPage', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('displays reimbursable distance after commuter exclusion', () => {
        jest.spyOn(DistanceRequestUtils, 'getRate').mockReturnValue({
            customUnitRateID: 'rate',
            unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            rate: 100,
            currency: CONST.CURRENCY.USD,
            name: 'Rate',
            index: 0,
        });
        const splitTransaction = createMock<Transaction>({
            transactionID: 'splitTransaction',
            reportID: 'report1',
            amount: 800,
            currency: CONST.CURRENCY.USD,
            merchant: 'Distance',
            created: '2026-08-07',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            comment: {
                originalTransactionID: 'originalTransaction',
                customUnit: {
                    routeDistanceMeters: 16093.44,
                    quantity: 10,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    commuterExclusion: 2,
                    reimbursableDistance: 8,
                },
            },
        });
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`) {
                return [splitTransaction];
            }
            return [undefined];
        });

        type Props = React.ComponentProps<typeof SplitExpenseEditPage>;
        render(
            <SplitExpenseEditPage
                route={createMock<Props['route']>({
                    key: 'split-expense',
                    name: SCREENS.MONEY_REQUEST.SPLIT_EXPENSE,
                    params: {reportID: 'report1', transactionID: 'sourceTransaction', splitExpenseTransactionID: 'splitTransaction'},
                })}
                navigation={createMock<Props['navigation']>({})}
            />,
        );

        expect(screen.getByTestId('menu-item-common.distance')).toHaveTextContent('8.00 mi');
    });
});
