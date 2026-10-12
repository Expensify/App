import {act, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useOnyx from '@hooks/useOnyx';

import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';

import ReportDetailsMenuItems from '@pages/DynamicReportDetailsPage/ReportDetailsMenuItems';
import type {ReportDetailsRequestData} from '@pages/DynamicReportDetailsPage/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../../utils/collections/reportActions';
import {createRandomReport} from '../../../utils/collections/reports';
import createMock from '../../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/MenuItem', () => {
    const {Text} = jest.requireActual<Record<string, React.FC<Record<string, unknown>>>>('react-native');
    return {
        __esModule: true,
        default: ({title}: {title: string}) => <Text testID="menuRow">{title}</Text>,
    };
});
jest.mock('@hooks/useOnyx', () => {
    const actual = jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx');
    return {__esModule: true, default: jest.fn(actual.default)};
});
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn(() => false));
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<Record<string, unknown>>('@react-navigation/native');
    return {...actualNav, useFocusEffect: jest.fn()};
});

const mockIsReportTopmostSplitNavigator = jest.mocked(isReportTopmostSplitNavigator);
const mockUseOnyx = jest.mocked(useOnyx);

const currentUserAccountID = 1;
const otherAccountID = 2;
const currentUserEmail = 'me@test.com';
const reportID = '100';

function getRenderedRows(): string[] {
    return screen.queryAllByTestId('menuRow').map((row) => String(row.props.children));
}

async function renderMenu(requestData?: ReportDetailsRequestData) {
    render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsContext.Provider value={{accountID: currentUserAccountID}}>
                <LocaleContextProvider>
                    <ReportDetailsMenuItems
                        reportID={reportID}
                        requestData={requestData}
                    />
                </LocaleContextProvider>
            </CurrentUserPersonalDetailsContext.Provider>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function seedReport(report: Report) {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
    });
}

const participants = {
    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
    [otherAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
};

function buildChat(chatType: Report['chatType'], overrides: Partial<Report> = {}): Report {
    return {
        ...createRandomReport(Number(reportID), chatType),
        type: CONST.REPORT.TYPE.CHAT,
        parentReportID: undefined,
        parentReportActionID: undefined,
        policyID: undefined,
        participants,
        ...overrides,
    };
}

describe('ReportDetailsMenuItems', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockUseOnyx.mockClear();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [currentUserAccountID]: {accountID: currentUserAccountID, login: currentUserEmail},
                [otherAccountID]: {accountID: otherAccountID, login: 'other@test.com'},
            });
        });
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should render no rows for a self DM', async () => {
        // Given a self DM, which the menu gate empties before any row
        await seedReport(buildChat(CONST.REPORT.CHAT_TYPE.SELF_DM));
        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_DEBUG_MODE_ENABLED, true);
        });

        // When the menu renders
        await renderMenu();

        // Then not even the Debug row shows, matching the early return on main
        expect(getRenderedRows()).toEqual([]);
    });

    it('should render no rows for an archived room', async () => {
        // Given an archived room
        await seedReport(buildChat(CONST.REPORT.CHAT_TYPE.POLICY_ROOM));
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {private_isArchived: new Date().toString()});
            await Onyx.merge(ONYXKEYS.IS_DEBUG_MODE_ENABLED, true);
        });

        // When the menu renders
        await renderMenu();

        // Then the archived gate empties the menu
        expect(getRenderedRows()).toEqual([]);
    });

    it('should render Members, Settings, Leave and Debug in order for a group chat', async () => {
        // Given a group chat with two members and debug mode on
        await seedReport(buildChat(CONST.REPORT.CHAT_TYPE.GROUP));
        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_DEBUG_MODE_ENABLED, true);
        });

        // When the menu renders
        await renderMenu();

        // Then the rows keep the push order of the original items array
        expect(getRenderedRows()).toEqual(['Members', 'Settings', 'Leave', 'Debug']);
    });

    it('should not subscribe to any transaction for a chat without request data', async () => {
        // Given a group chat, which carries no request data
        await seedReport(buildChat(CONST.REPORT.CHAT_TYPE.GROUP));

        // When the menu renders without it
        await renderMenu();

        // Then no row opens a transaction subscription, so the chat menu stays outside the money cluster
        const subscribedKeys = mockUseOnyx.mock.calls.map(([key]) => String(key));
        expect(subscribedKeys.some((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION))).toBe(false);
    });

    it('should render Invite instead of Members for a room the user is not a workspace member of', async () => {
        // Given a user created room whose workspace the user is not a member of
        await seedReport(buildChat(CONST.REPORT.CHAT_TYPE.POLICY_ROOM));

        // When the menu renders
        await renderMenu();

        // Then the Invite branch of the Members/Invite pair shows, in the Members slot
        expect(getRenderedRows()).toEqual(['Go to room', 'Invite', 'Settings', 'Leave']);
    });

    it('should render Go to workspace instead of Go to room when the room is already open behind the page', async () => {
        // Given a workspace chat of a policy the user administers, while that chat is the screen behind the Details page
        const policyID = 'ABC';
        await seedReport(buildChat(CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, {policyID, isOwnPolicyExpenseChat: true}));
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                id: policyID,
                name: 'Workspace',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                owner: currentUserEmail,
                outputCurrency: CONST.CURRENCY.USD,
                employeeList: {[currentUserEmail]: {email: currentUserEmail, role: CONST.POLICY.ROLE.ADMIN}},
            });
        });
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(reportID);

        // When the menu renders
        await renderMenu();

        // Then Go to room is hidden and Go to workspace takes its place near the end, because both rows read the same
        // room-open snapshot
        expect(getRenderedRows()).toEqual(['Members', 'Settings', 'Go to workspace']);
    });

    it('should render Mark as incomplete after Settings for a completed task', async () => {
        // Given a completed task owned by the current user in a group chat
        const parentReportID = '200';
        await seedReport({
            ...createRandomReport(Number(parentReportID), CONST.REPORT.CHAT_TYPE.GROUP),
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: undefined,
            parentReportActionID: undefined,
            participants,
        });
        await seedReport({
            ...createRandomReport(Number(reportID), undefined),
            type: CONST.REPORT.TYPE.TASK,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            ownerAccountID: currentUserAccountID,
            parentReportID,
            parentReportActionID: undefined,
            policyID: undefined,
            participants,
        });

        // When the menu renders
        await renderMenu();

        // Then the task row sits after Settings, where the original task block pushed it
        expect(getRenderedRows()).toEqual(['Members', 'Settings', 'Mark as incomplete']);
    });

    it('should render the track expense rows between Settings and the later rows', async () => {
        // Given a thread on a track expense in the self DM, with its request data mounted
        const selfDMReportID = '300';
        const parentReportActionID = '301';
        const trackAction: ReportAction = {
            ...createRandomReportAction(Number(parentReportActionID)),
            reportActionID: parentReportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.TRACK, amount: 100, currency: CONST.CURRENCY.USD, IOUTransactionID: '400'},
        };
        await seedReport(buildChat(CONST.REPORT.CHAT_TYPE.SELF_DM, {reportID: selfDMReportID}));
        await seedReport(buildChat(undefined, {parentReportID: selfDMReportID, parentReportActionID}));
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`, {[parentReportActionID]: trackAction});
        });
        const requestData = createMock<ReportDetailsRequestData>({isDeletedParentAction: false});

        // When the menu renders for the money case
        await renderMenu(requestData);

        // Then both submit destinations render right after Settings, as the inline track pushes did
        expect(getRenderedRows()).toEqual(['Members', 'Settings', 'Submit to a friend', 'Submit to my employer', 'Leave']);
    });
});
