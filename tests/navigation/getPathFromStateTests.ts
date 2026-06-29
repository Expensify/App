import {getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';

jest.mock('@react-navigation/native', () => ({
    getPathFromState: jest.fn(),
}));

jest.mock('@libs/Navigation/linkingConfig/config', () => ({
    config: {},
    normalizedConfigs: {
        TestDynamicScreen: {path: 'test-dynamic'},
        StandardScreen: {path: 'standard'},
        VerifyAccountScreen: {path: 'verify-account'},
        CountryScreen: {path: 'country'},
        FlagScreen: {path: 'flag/:reportID/:reportActionID'},
        ConstantPickerScreen: {path: 'constant-picker'},
        WalletScreen: {path: 'settings/wallet'},
        ReportScreen: {path: 'r/:reportID'},
        SplitExpenseScreen: {path: 'split-expense/:reportID'},
        SplitExpenseQueryScreen: {path: 'split-expense-q/:reportID'},

        AmountTab: {path: 'amount'},
        ScanTab: {path: 'scan'},
    },
    screensWithOnyxTabNavigator: new Set(['SplitExpenseScreen', 'SplitExpenseQueryScreen']),
}));

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        TEST_DYNAMIC: {path: 'test-dynamic'},
        VERIFY_ACCOUNT: {path: 'verify-account'},
        ADDRESS_COUNTRY: {path: 'country', queryParams: ['country']},
        FLAG: {path: 'flag/:reportID/:reportActionID'},
        CONSTANT_PICKER: {path: 'constant-picker', queryParams: ['formType', 'fieldName', 'fieldValue']},
        SPLIT_EXPENSE: {path: 'split-expense/:reportID'},
        SPLIT_EXPENSE_QUERY: {path: 'split-expense-q/:reportID', queryParams: ['currency']},
    },
}));

type RouteEntry = {
    name: string;
    params?: Record<string, unknown>;
    path?: string;
    state?: {routes: RouteEntry[]; index: number};
};

type TestState = {
    routes: RouteEntry[];
    index: number;
};

function buildState(routes: RouteEntry[], index?: number): TestState {
    return {
        routes,
        index: index ?? routes.length - 1,
    } as TestState;
}

function realFindFocusedRoute(s: TestState | RouteEntry['state']): RouteEntry | undefined {
    let current: TestState | RouteEntry['state'] = s;
    while (current?.routes?.[current.index ?? 0]?.state != null) {
        current = current.routes[current.index ?? 0].state;
    }
    return current?.routes?.[current?.index ?? 0];
}

const staticBasePaths: Record<string, (params?: Record<string, unknown>) => string> = {
    WalletScreen: () => '/settings/wallet',
    ReportScreen: (params) => `/r/${(params?.reportID as string) ?? ''}`,
};

describe('getPathFromState', () => {
    const mockRNGetPathFromState = RNGetPathFromState as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should resolve dynamic screen from pattern and params', () => {
        mockRNGetPathFromState.mockImplementation(staticBasePaths.WalletScreen);

        const state = buildState([{name: 'WalletScreen'}, {name: 'TestDynamicScreen'}]);

        const result = getPathFromState(state as PartialState<NavigationState>);

        expect(result).toBe('/settings/wallet/test-dynamic');
    });

    it('should use RN getPathFromState for standard screens', () => {
        const expectedPath = '/standard/path';
        mockRNGetPathFromState.mockReturnValue(expectedPath);

        const state = buildState([{name: 'StandardScreen'}]);
        const result = getPathFromState(state as PartialState<NavigationState>);

        expect(result).toBe(expectedPath);
        expect(mockRNGetPathFromState).toHaveBeenCalledWith(state, expect.anything());
    });

    it('should handle state where no route is focused', () => {
        mockRNGetPathFromState.mockReturnValue('/fallback');

        const state = buildState([{name: 'StandardScreen'}]);
        const result = getPathFromState(state as PartialState<NavigationState>);

        expect(result).toBe('/fallback');
        expect(mockRNGetPathFromState).toHaveBeenCalled();
    });

    describe('dynamic route resolution from pattern and params', () => {
        beforeEach(() => {
            mockRNGetPathFromState.mockImplementation((s: TestState) => {
                const route = realFindFocusedRoute(s);
                const builder = staticBasePaths[route?.name ?? ''];
                return builder ? builder(route?.params) : '/unknown';
            });
        });

        it('simple suffix (no params)', () => {
            const state = buildState([{name: 'WalletScreen'}, {name: 'VerifyAccountScreen'}]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/verify-account');
        });

        it('suffix with params', () => {
            const state = buildState([
                {name: 'ReportScreen', params: {reportID: '123'}},
                {name: 'FlagScreen', params: {reportID: '456', reportActionID: 'abc'}},
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/r/123/flag/456/abc');
        });

        it('suffix with query params', () => {
            const state = buildState([{name: 'WalletScreen'}, {name: 'CountryScreen', params: {country: 'PL'}}]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/country?country=PL');
        });

        it('suffix with multiple query params', () => {
            const state = buildState([
                {name: 'ReportScreen', params: {reportID: '123'}},
                {name: 'ConstantPickerScreen', params: {formType: 'report', fieldName: 'status', fieldValue: 'open', reportID: '123'}},
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/r/123/constant-picker?formType=report&fieldName=status&fieldValue=open');
        });

        it('suffix with query params config but params missing', () => {
            const state = buildState([{name: 'WalletScreen'}, {name: 'CountryScreen', params: {}}]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/country');
        });

        it('suffix with partial query params (some present, some missing)', () => {
            const state = buildState([
                {name: 'ReportScreen', params: {reportID: '123'}},
                {name: 'ConstantPickerScreen', params: {formType: 'report', fieldName: 'status'}},
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/r/123/constant-picker?formType=report&fieldName=status');
        });

        it('inner dynamic suffix has path params, outer is simple', () => {
            const state = buildState([
                {name: 'ReportScreen', params: {reportID: '123'}},
                {name: 'FlagScreen', params: {reportID: '456', reportActionID: 'abc'}},
                {name: 'VerifyAccountScreen'},
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/r/123/flag/456/abc/verify-account');
        });

        it('inner dynamic suffix has query params, outer appends suffix', () => {
            const state = buildState([
                {name: 'WalletScreen'},
                {name: 'CountryScreen', params: {country: 'US'}},
                {name: 'ConstantPickerScreen', params: {formType: 'report', fieldName: 'status', fieldValue: 'open'}},
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/country/constant-picker?country=US&formType=report&fieldName=status&fieldValue=open');
        });

        it('two simple dynamic suffixes, no params on first', () => {
            const state = buildState([{name: 'WalletScreen'}, {name: 'VerifyAccountScreen'}, {name: 'CountryScreen', params: {country: 'US'}}]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/verify-account/country?country=US');
        });

        it('params + query params stacking', () => {
            const state = buildState([
                {name: 'ReportScreen', params: {reportID: '123'}},
                {name: 'FlagScreen', params: {reportID: '456', reportActionID: 'abc'}},
                {name: 'CountryScreen', params: {country: 'US'}},
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/r/123/flag/456/abc/country?country=US');
        });

        it('three stacked dynamic suffixes', () => {
            const state = buildState([
                {name: 'WalletScreen'},
                {name: 'VerifyAccountScreen'},
                {name: 'CountryScreen', params: {country: 'US'}},
                {name: 'ConstantPickerScreen', params: {formType: 'report', fieldName: 'x'}},
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/verify-account/country/constant-picker?country=US&formType=report&fieldName=x');
        });

        it('dynamic screen inside a nested navigator', () => {
            const state = buildState([
                {
                    name: 'RHPNavigator',
                    state: buildState([{name: 'WalletScreen'}, {name: 'VerifyAccountScreen'}]),
                },
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/verify-account');
        });

        it('two dynamic suffixes inside nested navigator', () => {
            const state = buildState([
                {
                    name: 'RHPNavigator',
                    state: buildState([{name: 'WalletScreen'}, {name: 'VerifyAccountScreen'}, {name: 'CountryScreen', params: {country: 'PL'}}]),
                },
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/verify-account/country?country=PL');
        });

        it('only dynamic route, no base (state has single route)', () => {
            const state = buildState([{name: 'VerifyAccountScreen'}]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/verify-account');
        });

        it('trailing slash normalization from base path', () => {
            mockRNGetPathFromState.mockReturnValue('/settings/wallet/');

            const state = buildState([{name: 'WalletScreen'}, {name: 'VerifyAccountScreen'}]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/verify-account');
        });

        it('params with special characters are encoded', () => {
            const state = buildState([
                {name: 'ReportScreen', params: {reportID: '123'}},
                {name: 'FlagScreen', params: {reportID: 'a/b', reportActionID: 'c&d'}},
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/r/123/flag/a%2Fb/c%26d');
        });

        it('query param values with special characters are encoded', () => {
            const state = buildState([{name: 'WalletScreen'}, {name: 'CountryScreen', params: {country: 'a&b=c'}}]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/country?country=a%26b%3Dc');
        });

        it('dynamic route with no params at all (params undefined)', () => {
            const state = buildState([{name: 'WalletScreen'}, {name: 'CountryScreen'}]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/country');
        });
    });

    describe('tab navigator integration (OnyxTabNavigator)', () => {
        beforeEach(() => {
            mockRNGetPathFromState.mockImplementation((s: TestState) => {
                const route = realFindFocusedRoute(s);
                const builder = staticBasePaths[route?.name ?? ''];
                return builder ? builder(route?.params) : '/unknown';
            });
        });

        it('appends focused tab path segment when first tab is focused', () => {
            const state = buildState([
                {name: 'WalletScreen'},
                {
                    name: 'SplitExpenseScreen',
                    params: {reportID: '123'},
                    state: buildState([{name: 'AmountTab'}, {name: 'ScanTab'}], 0),
                },
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/split-expense/123/amount');
        });

        it('appends focused tab path segment when second tab is focused', () => {
            const state = buildState([
                {name: 'WalletScreen'},
                {
                    name: 'SplitExpenseScreen',
                    params: {reportID: '123'},
                    state: buildState([{name: 'AmountTab'}, {name: 'ScanTab'}], 1),
                },
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/split-expense/123/scan');
        });

        it('omits tab segment when tab-hosting screen has no nested state', () => {
            const state = buildState([{name: 'WalletScreen'}, {name: 'SplitExpenseScreen', params: {reportID: '123'}}]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/split-expense/123');
        });

        it('tab-hosting screen inside a nested navigator', () => {
            const state = buildState([
                {
                    name: 'RHPNavigator',
                    state: buildState([
                        {name: 'WalletScreen'},
                        {
                            name: 'SplitExpenseScreen',
                            params: {reportID: '789'},
                            state: buildState([{name: 'AmountTab'}, {name: 'ScanTab'}], 1),
                        },
                    ]),
                },
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/split-expense/789/scan');
        });

        it('tab-hosting screen is the only route (no base)', () => {
            const state = buildState([
                {
                    name: 'SplitExpenseScreen',
                    params: {reportID: '42'},
                    state: buildState([{name: 'AmountTab'}, {name: 'ScanTab'}], 0),
                },
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/split-expense/42/amount');
        });

        it('tab segment is placed before query params when the tab-host screen has query params', () => {
            const state = buildState([
                {name: 'WalletScreen'},
                {
                    name: 'SplitExpenseQueryScreen',
                    params: {reportID: '123', currency: 'USD'},
                    state: buildState([{name: 'AmountTab'}, {name: 'ScanTab'}], 1),
                },
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/split-expense-q/123/scan?currency=USD');
        });

        it('popFocusedRoute treats tab-hosting screen as a leaf (removes whole screen, not individual tab)', () => {
            const state = buildState([
                {name: 'WalletScreen'},
                {
                    name: 'SplitExpenseScreen',
                    params: {reportID: '123'},
                    state: buildState([{name: 'AmountTab'}, {name: 'ScanTab'}], 0),
                },
                {name: 'VerifyAccountScreen'},
            ]);

            expect(getPathFromState(state as PartialState<NavigationState>)).toBe('/settings/wallet/split-expense/123/amount/verify-account');
        });
    });
});
