import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';

import ReportSubmitToContent from '@pages/ReportSubmitToContent';

import {submitReport} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import type Report from '@src/types/onyx/Report';

import React from 'react';

import createRandomPolicy from '../utils/collections/policies';

const mockUseState = React.useState;

const SUBMITTER_EMAIL = 'submitter@example.com';
const MANAGER_EMAIL = 'manager@example.com';
const mockPersonalDetailsList: Record<number, {accountID: number; login: string; displayName: string}> = {};
mockPersonalDetailsList[1] = {accountID: 1, login: SUBMITTER_EMAIL, displayName: 'Submitter'};
mockPersonalDetailsList[2] = {accountID: 2, login: MANAGER_EMAIL, displayName: 'Manager'};

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/InviteMemberListItem', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/BlockingView', () => jest.fn(() => null));
jest.mock('@components/FormHelpMessage', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: jest.fn(() => ({currentSearchQueryJSON: undefined, currentSearchKey: undefined})),
    useSearchResultsContext: jest.fn(() => ({currentSearchResults: undefined})),
}));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2)})),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, login: 'submitter@example.com', email: 'submitter@example.com'})));
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@hooks/useIsInLandscapeMode', () => jest.fn(() => false));
jest.mock('@hooks/useKeyboardState', () => jest.fn(() => ({keyboardActiveHeight: 0})));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: jest.fn(() => ({PaperAirplane: 'paper'}))}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        dateFnsLocale: {},
    })),
);
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
// The only selector-based read that matters here is the submitter login; every plain read that the two
// tested paths touch either wants the personal-details map or ignores its value, so returning the map by
// default is safe. Reads that pass a selector get the submitter login string.
jest.mock('@hooks/useOnyx', () => jest.fn((key: string, options?: {selector?: unknown}) => (options?.selector ? ['submitter@example.com'] : [mockPersonalDetailsList])));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: jest.fn(() => false)})));
jest.mock('@hooks/useSearchShouldCalculateTotals', () => jest.fn(() => false));
jest.mock('@hooks/useStyleUtils', () => jest.fn(() => ({getMinimumHeight: () => ({})})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: jest.fn(() => false)}));
jest.mock('@libs/Navigation/Navigation', () => ({dismissToPreviousRHP: jest.fn()}));
jest.mock('@libs/OptionsListUtils', () => ({
    getSearchValueForPhoneOrEmail: jest.fn((value: string) => value),
    getUserToInviteOption: jest.fn(() => null),
    sortAlphabetically: jest.fn((items: unknown[]) => items),
}));
jest.mock('@libs/PersonalDetailsUtils', () => ({
    getKnownAccountIDByLogin: jest.fn(() => undefined),
    getPersonalDetailsByID: jest.fn(() => undefined),
}));
jest.mock('@libs/PolicyUtils', () => ({
    getSubmitToEmail: jest.fn(() => 'submitter@example.com'),
    getMemberAccountIDsForWorkspace: jest.fn(() => {
        const emailToAccountID: Record<string, number> = {};
        emailToAccountID['manager@example.com'] = 2;
        emailToAccountID['submitter@example.com'] = 1;
        return emailToAccountID;
    }),
    getAccountIDForSubmitManagerEmail: jest.fn(() => 2),
}));
jest.mock('@libs/ReportUtils', () => ({
    hasViolations: jest.fn(() => false),
    isExpenseReport: jest.fn(() => true),
    isMoneyRequestReportPendingDeletion: jest.fn(() => false),
}));
jest.mock('@libs/tokenizedSearch', () => jest.fn(() => []));
jest.mock('@libs/UserUtils', () => ({expensifyLoginsSelector: jest.fn()}));
jest.mock('@libs/actions/Search', () => ({search: jest.fn()}));

jest.mock('@userActions/Report', () => ({searchUserInServer: jest.fn()}));
jest.mock('@userActions/IOU/ReportWorkflow', () => ({submitReport: jest.fn()}));

jest.mock('@selectors/Account', () => ({delegateEmailSelector: jest.fn()}));
jest.mock('@selectors/Onboarding', () => ({isTrackIntentUserSelector: jest.fn()}));
jest.mock('@src/selectors/PersonalDetails', () => ({personalDetailsLoginSelector: jest.fn(() => jest.fn())}));

type MockSelectionListProps = {
    data: Array<ListItem & {email?: string; isSelected?: boolean}>;
    initiallyFocusedItemKey?: string;
    confirmButtonOptions?: {onConfirm?: () => void};
    children?: React.ReactNode;
};

const report = {reportID: '1', ownerAccountID: 1} as Report;
const policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
    employeeList: {
        [SUBMITTER_EMAIL]: {email: SUBMITTER_EMAIL},
        [MANAGER_EMAIL]: {email: MANAGER_EMAIL},
    },
};

function renderContent() {
    return render(
        <ReportSubmitToContent
            report={report}
            policy={policy}
            isLoadingReportData={false}
            onDismiss={jest.fn()}
        />,
    );
}

describe('ReportSubmitToContent', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const mockedSubmitReport = jest.mocked(submitReport);

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockedSubmitReport.mockClear();
    });

    it('does not auto-select any recipient when opening a submit workspace', () => {
        renderContent();

        const props = mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

        expect(props?.data.length).toBeGreaterThan(0);
        expect(props?.data.some((item) => item.isSelected)).toBe(false);
        expect(props?.initiallyFocusedItemKey).toBeUndefined();
        // No error is shown before the user does anything.
        expect(props?.children).toBeFalsy();
    });

    it('shows the recipient error instead of submitting when Confirm is pressed with nothing selected', () => {
        renderContent();

        let props = mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;
        act(() => {
            props?.confirmButtonOptions?.onConfirm?.();
        });

        props = mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

        // Error content mounts (the mocked FormHelpMessage element) and submit never fires.
        expect(props?.children).toBeTruthy();
        expect(mockedSubmitReport).not.toHaveBeenCalled();
    });
});
