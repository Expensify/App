// Policy and session mock data uses property names that do not follow camelCase convention
/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import useDefaultSearchQuery from '@hooks/useDefaultSearchQuery';
import {buildCannedSearchQuery, buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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

describe('useDefaultSearchQuery', () => {
    beforeEach(() => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {};
        onyxData[ONYXKEYS.SESSION] = {email: 'test@example.com', accountID: 123};
        mockUseOnyx.mockClear();
    });

    it('returns default canned search query when no policies exist', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {};

        const {result} = renderHook(() => useDefaultSearchQuery());

        expect(result.current).toBe(buildCannedSearchQuery());
    });

    it('returns default canned search query when policies are null', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = null;

        const {result} = renderHook(() => useDefaultSearchQuery());

        expect(result.current).toBe(buildCannedSearchQuery());
    });

    it('returns default canned search query when no paid policies exist', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                type: CONST.POLICY.TYPE.PERSONAL,
            },
        };

        const {result} = renderHook(() => useDefaultSearchQuery());

        expect(result.current).toBe(buildCannedSearchQuery());
    });

    it('returns default canned search query when accountID is missing', () => {
        onyxData[ONYXKEYS.SESSION] = {email: 'test@example.com', accountID: undefined};
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: 'test@example.com',
            },
        };

        const {result} = renderHook(() => useDefaultSearchQuery());

        expect(result.current).toBe(buildCannedSearchQuery());
    });

    it('returns SUBMIT query when paid policies exist but user is not an approver', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                approver: 'other@example.com',
            },
        };

        const {result} = renderHook(() => useDefaultSearchQuery());

        const expectedQuery = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
            from: ['123'],
        });
        expect(result.current).toBe(expectedQuery);
    });

    it('returns SUBMIT query when approval mode is optional even if user is approver', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                approver: 'test@example.com',
            },
        };

        const {result} = renderHook(() => useDefaultSearchQuery());

        const expectedQuery = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
            from: ['123'],
        });
        expect(result.current).toBe(expectedQuery);
    });

    it('returns APPROVE query when user is the approver on a paid policy with approval enabled', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: 'test@example.com',
            },
        };

        const {result} = renderHook(() => useDefaultSearchQuery());

        const expectedQuery = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
            to: ['123'],
        });
        expect(result.current).toBe(expectedQuery);
    });

    it('returns APPROVE query when user is the approver on a corporate policy', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                type: CONST.POLICY.TYPE.CORPORATE,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: 'test@example.com',
            },
        };

        const {result} = renderHook(() => useDefaultSearchQuery());

        const expectedQuery = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
            to: ['123'],
        });
        expect(result.current).toBe(expectedQuery);
    });

    it('returns APPROVE query when user is a submitsTo target in employee list', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: 'other@example.com',
                employeeList: {
                    'someone@example.com': {submitsTo: 'test@example.com'},
                },
            },
        };

        const {result} = renderHook(() => useDefaultSearchQuery());

        const expectedQuery = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
            to: ['123'],
        });
        expect(result.current).toBe(expectedQuery);
    });

    it('returns APPROVE query when user is a forwardsTo target in employee list', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: 'other@example.com',
                employeeList: {
                    'someone@example.com': {forwardsTo: 'test@example.com'},
                },
            },
        };

        const {result} = renderHook(() => useDefaultSearchQuery());

        const expectedQuery = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
            to: ['123'],
        });
        expect(result.current).toBe(expectedQuery);
    });

    it('returns SUBMIT query when paid policies exist but approval is not enabled on any', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: undefined,
                approver: 'test@example.com',
            },
        };

        const {result} = renderHook(() => useDefaultSearchQuery());

        const expectedQuery = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
            from: ['123'],
        });
        expect(result.current).toBe(expectedQuery);
    });

    it('returns APPROVE query if at least one policy makes user an approver among multiple policies', () => {
        onyxData[ONYXKEYS.COLLECTION.POLICY] = {
            policy1: {
                id: 'policy1',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                approver: 'test@example.com',
            },
            policy2: {
                id: 'policy2',
                type: CONST.POLICY.TYPE.CORPORATE,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: 'test@example.com',
            },
        };

        const {result} = renderHook(() => useDefaultSearchQuery());

        const expectedQuery = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
            to: ['123'],
        });
        expect(result.current).toBe(expectedQuery);
    });
});
