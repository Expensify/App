import {act, render} from '@testing-library/react-native';

import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';

import {getSubmitToEmail} from '@libs/PolicyUtils';

import ReportSubmitToContent from '@pages/ReportSubmitToContent';

import {submitReport} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';

const mockUseState = React.useState;

const SUBMITTER_EMAIL = 'submitter@example.com';
const MANAGER_EMAIL = 'manager@example.com';
const mockPersonalDetailsList: Record<number, {accountID: number; login: string; displayName: string}> = {};
mockPersonalDetailsList[1] = {accountID: 1, login: SUBMITTER_EMAIL, displayName: 'Submitter'};
mockPersonalDetailsList[2] = {accountID: 2, login: MANAGER_EMAIL, displayName: 'Manager'};
// `mock`-prefixed so they can be referenced inside the hoisted `useOnyx` jest.mock factory below.
const mockPersonalDetailsListKey = ONYXKEYS.PERSONAL_DETAILS_LIST;
const mockLoginsKey = ONYXKEYS.LOGINS;

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
// Switch on the Onyx key so each read returns something meaningful for that key instead of a single blanket value.
// Only `PERSONAL_DETAILS_LIST` and `LOGINS` feed the tested paths; everything else (delegate email, track-intent
// flag, billing/violations, country code) is deliberately `undefined` so a newly added dependency fails loudly here
// rather than silently receiving the submitter login.
jest.mock('@hooks/useOnyx', () =>
    jest.fn((key: string, options?: {selector?: unknown}) => {
        switch (key) {
            case mockPersonalDetailsListKey:
                // With a selector this read is `submitterLogin` (the report owner's login); without one it is the
                // full personal-details map.
                return options?.selector ? ['submitter@example.com'] : [mockPersonalDetailsList];
            case mockLoginsKey:
                return [{}];
            default:
                return [undefined];
        }
    }),
);
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

// Read the props off the real `SelectionList` mock (no re-derived narrowed shape), so the test stops compiling if a
// prop it reads (`confirmButtonOptions`, `listEmptyContent`, `textInputOptions`, `children`…) is renamed or retyped.
const getLastSelectionListProps = () => jest.mocked(SelectionList).mock.lastCall?.[0];

const report = createRandomReport(1);
const policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.SUBMIT),
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
    const mockedFormHelpMessage = jest.mocked(FormHelpMessage);

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockedSubmitReport.mockClear();
        mockedFormHelpMessage.mockClear();
        // Default: the workspace resolves the submitter's own email (the self-referential single-member case).
        jest.mocked(getSubmitToEmail).mockReturnValue(SUBMITTER_EMAIL);
    });

    it('does not auto-select any recipient when opening a submit workspace', () => {
        renderContent();

        const props = getLastSelectionListProps();

        expect(props?.data.length).toBeGreaterThan(0);
        expect(props?.data.some((item) => item.isSelected)).toBe(false);
        expect(props?.initiallyFocusedItemKey).toBeUndefined();
        // No error is shown before the user does anything.
        expect(props?.children).toBeFalsy();
    });

    it('does not auto-select a real member when the workspace resolves a configured recipient', () => {
        // Multi-member case: `getSubmitToEmail` resolves a real other member, not the submitter. The original
        // self-only fix passed the single-member case but still auto-selected here, which is what got it rejected.
        jest.mocked(getSubmitToEmail).mockReturnValue(MANAGER_EMAIL);
        renderContent();

        const props = getLastSelectionListProps();

        expect(props?.data.length).toBeGreaterThan(0);
        expect(props?.data.some((item) => item.isSelected)).toBe(false);
    });

    it('shows the recipient error instead of submitting when Confirm is pressed with nothing selected', () => {
        renderContent();

        let props = getLastSelectionListProps();
        act(() => {
            props?.confirmButtonOptions?.onConfirm?.();
        });

        props = getLastSelectionListProps();

        // Submit never fires while nothing is selected.
        expect(mockedSubmitReport).not.toHaveBeenCalled();

        // On the populated state the error renders as `SelectionList` children. Render them and assert it is the
        // recipient error specifically, so a revert to `common.error.pleaseSelectOne` would fail this test.
        expect(props?.children).toBeTruthy();
        mockedFormHelpMessage.mockClear();
        render(<View>{props?.children}</View>);
        expect(mockedFormHelpMessage.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({message: 'iou.submitReportTo.selectRecipientError', isError: true}));
    });

    it('shows the recipient error on the empty state when Confirm is pressed after a non-matching search', () => {
        renderContent();

        let props = getLastSelectionListProps();
        // A search that matches no one collapses the list to the empty state (`tokenizedSearch` is mocked to []).
        act(() => {
            props?.textInputOptions?.onChangeText?.('zzzzzzzz');
        });

        props = getLastSelectionListProps();
        act(() => {
            props?.confirmButtonOptions?.onConfirm?.();
        });

        props = getLastSelectionListProps();
        expect(mockedSubmitReport).not.toHaveBeenCalled();

        // `BaseSelectionList` only renders `children` on its non-empty branch, so on the empty state the error must
        // live inside `listEmptyContent`. Render it to confirm the error is actually reachable there.
        mockedFormHelpMessage.mockClear();
        render(<View>{props?.listEmptyContent}</View>);
        expect(mockedFormHelpMessage.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({message: 'iou.submitReportTo.selectRecipientError', isError: true}));
    });
});
