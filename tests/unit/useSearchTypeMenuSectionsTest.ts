/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

jest.mock('@libs/ReportUtils', () => ({
    getPersonalDetailsForAccountID: jest.fn(),
    hasEmptyReportsForPolicy: jest.fn(() => false),
    hasViolations: jest.fn(() => false),
}));

jest.mock('@userActions/Report', () => ({
    createNewReport: jest.fn(() => ({reportID: 'mock-report-id'})),
}));

jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));
jest.mock('@hooks/useCreateEmptyReportConfirmation', () => jest.fn(() => ({openCreateReportConfirmation: jest.fn(), CreateReportConfirmationModal: null})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: jest.fn(() => false)})));
jest.mock('@hooks/useReportCounts', () =>
    jest.fn(() => ({
        [require('@src/CONST').default.SEARCH.SEARCH_KEYS.SUBMIT]: 0,
        [require('@src/CONST').default.SEARCH.SEARCH_KEYS.APPROVE]: 0,
        [require('@src/CONST').default.SEARCH.SEARCH_KEYS.PAY]: 0,
        [require('@src/CONST').default.SEARCH.SEARCH_KEYS.EXPORT]: 0,
    })),
);

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn(
    (
        key: string,
        options?: {
            selector?: (value: unknown) => unknown;
        },
    ) => {
        const value = onyxData[key];
        const selectedValue = options?.selector ? options.selector(value as never) : value;
        return [selectedValue];
    },
);

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => mockUseOnyx(key, options),
}));

jest.mock('@selectors/Policy', () => ({
    createPoliciesSelector: jest.fn((policies: OnyxCollection<Policy>, policySelector: (policy: OnyxEntry<Policy>) => OnyxEntry<Policy>) => {
        if (!policies) {
            return policies;
        }

        return Object.fromEntries(Object.entries(policies).map(([policyKey, policyValue]) => [policyKey, policyValue ? policySelector(policyValue) : policyValue]));
    }),
}));

describe('useSearchTypeMenuSections', () => {
    beforeEach(() => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {};
        onyxData[ONYXKEYS.SESSION] = {email: 'test@example.com', accountID: 1};
        onyxData[ONYXKEYS.SAVED_SEARCHES] = {};
        onyxData[ONYXKEYS.COLLECTION.REPORT] = {};

        mockUseOnyx.mockClear();
    });

    it('shows suggested search skeleton when policies are missing employeeList', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                employeeList: undefined,
                exporter: 'test@gmail.com',
            },
        };

        const {result} = renderHook(() => useSearchTypeMenuSections());

        expect(result.current.shouldShowSuggestedSearchSkeleton).toBe(true);
        expect(result.current.getTypeMenuSections).toBeDefined();
        expect(typeof result.current.getTypeMenuSections).toBe('function');
    });

    it('shows suggested search skeleton when policies are missing exporter', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                employeeList: {'test@gmail.com': {accountID: 10000}},
                exporter: undefined,
            },
        };

        const {result} = renderHook(() => useSearchTypeMenuSections());

        expect(result.current.shouldShowSuggestedSearchSkeleton).toBe(true);
    });

    it('hides suggested search skeleton when at least one policy has required data', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                employeeList: {'test@gmail.com': {accountID: 10000}},
                exporter: '',
            },
            policy2: {
                id: 'policy2',
                employeeList: undefined,
                exporter: undefined,
            },
        };

        const {result} = renderHook(() => useSearchTypeMenuSections());

        expect(result.current.shouldShowSuggestedSearchSkeleton).toBe(false);
    });

    it('does not show suggested search skeleton when offline', () => {
        (useNetwork as jest.Mock).mockReturnValue({
            isOffline: true,
        });
        const {result} = renderHook(() => useSearchTypeMenuSections());

        expect(result.current.shouldShowSuggestedSearchSkeleton).toBe(false);
    });
});
