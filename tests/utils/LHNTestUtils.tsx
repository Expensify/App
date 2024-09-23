/* eslint-disable @typescript-eslint/naming-convention */
import type * as Navigation from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import type {ReactElement} from 'react';
import React from 'react';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@components/withCurrentReportID';
import {EnvironmentProvider} from '@components/withEnvironment';
import {ReportIDsContextProvider} from '@hooks/useReportIDs';
import DateUtils from '@libs/DateUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ReportActionItemSingle from '@pages/home/report/ReportActionItemSingle';
import SidebarLinksData from '@pages/home/sidebar/SidebarLinksData';
import CONST from '@src/CONST';
import type {PersonalDetailsList, Policy, Report, ReportAction} from '@src/types/onyx';
import type ReportActionName from '@src/types/onyx/ReportActionName';

type MockedReportActionItemSingleProps = {
    /** Determines if the avatar is displayed as a subscript (positioned lower than normal) */
    shouldShowSubscriptAvatar?: boolean;

    /** Report for this action */
    report: Report;

    /** All the data of the action */
    reportAction: ReportAction;
};

type MockedSidebarLinksProps = {
    /** Current report id */
    currentReportID?: string;
};

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: jest.fn(),
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: jest.fn(),
        }),
        createNavigationContainerRef: jest.fn(),
    };
});

const fakePersonalDetails: PersonalDetailsList = {
    1: {
        accountID: 1,
        login: 'email1@test.com',
        displayName: 'Email One',
        avatar: 'none',
        firstName: 'One',
    },
    2: {
        accountID: 2,
        login: 'email2@test.com',
        displayName: 'Email Two',
        avatar: 'none',
        firstName: 'Two',
    },
    3: {
        accountID: 3,
        login: 'email3@test.com',
        displayName: 'Email Three',
        avatar: 'none',
        firstName: 'Three',
    },
    4: {
        accountID: 4,
        login: 'email4@test.com',
        displayName: 'Email Four',
        avatar: 'none',
        firstName: 'Four',
    },
    5: {
        accountID: 5,
        login: 'email5@test.com',
        displayName: 'Email Five',
        avatar: 'none',
        firstName: 'Five',
    },
    6: {
        accountID: 6,
        login: 'email6@test.com',
        displayName: 'Email Six',
        avatar: 'none',
        firstName: 'Six',
    },
    7: {
        accountID: 7,
        login: 'email7@test.com',
        displayName: 'Email Seven',
        avatar: 'none',
        firstName: 'Seven',
    },
    8: {
        accountID: 8,
        login: 'email8@test.com',
        displayName: 'Email Eight',
        avatar: 'none',
        firstName: 'Eight',
    },
    9: {
        accountID: 9,
        login: 'email9@test.com',
        displayName: 'Email Nine',
        avatar: 'none',
        firstName: 'Nine',
    },
};

let lastFakeReportID = 0;
let lastFakeReportActionID = 0;

/**
 * @param millisecondsInThePast the number of milliseconds in the past for the last message timestamp (to order reports by most recent messages)
 */
function getFakeReport(participantAccountIDs = [1, 2], millisecondsInThePast = 0, isUnread = false): Report {
    const lastVisibleActionCreated = DateUtils.getDBTime(Date.now() - millisecondsInThePast);

    return {
        type: CONST.REPORT.TYPE.CHAT,
        reportID: `${++lastFakeReportID}`,
        reportName: 'Report',
        lastVisibleActionCreated,
        lastReadTime: isUnread ? DateUtils.subtractMillisecondsFromDateTime(lastVisibleActionCreated, 1) : lastVisibleActionCreated,
        participants: ReportUtils.buildParticipantsFromAccountIDs(participantAccountIDs),
    };
}

/**
 * @param millisecondsInThePast the number of milliseconds in the past for the last message timestamp (to order reports by most recent messages)
 */
function getFakeReportAction(actor = 'email1@test.com', millisecondsInThePast = 0): ReportAction {
    const timestamp = Date.now() - millisecondsInThePast;
    const created = DateUtils.getDBTime(timestamp);
    const reportActionID = ++lastFakeReportActionID;

    return {
        actor,
        actorAccountID: 1,
        reportActionID: `${reportActionID}`,
        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        shouldShow: true,
        created,
        person: [
            {
                type: 'TEXT',
                style: 'strong',
                text: 'Email One',
            },
        ],
        automatic: false,
        message: [
            {
                type: 'COMMENT',
                html: 'hey',
                text: 'hey',
                isEdited: false,
                whisperedTo: [],
                isDeletedParentAction: false,
            },
        ],
        originalMessage: {
            whisperedTo: [],
            html: 'hey',
            lastModified: '2023-08-28 15:28:12.432',
        },
    };
}

function getAdvancedFakeReport(isArchived: boolean, isUserCreatedPolicyRoom: boolean, hasAddWorkspaceError: boolean, isUnread: boolean, isPinned: boolean): Report {
    return {
        ...getFakeReport([1, 2], 0, isUnread),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: isUserCreatedPolicyRoom ? CONST.REPORT.CHAT_TYPE.POLICY_ROOM : CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        statusNum: isArchived ? CONST.REPORT.STATUS_NUM.CLOSED : 0,
        stateNum: isArchived ? CONST.REPORT.STATE_NUM.APPROVED : 0,
        errorFields: hasAddWorkspaceError ? {1708946640843000: {addWorkspaceRoom: 'blah'}} : undefined,
        isPinned,
    };
}

/**
 * @param millisecondsInThePast the number of milliseconds in the past for the last message timestamp (to order reports by most recent messages)
 */
function getFakeReportWithPolicy(participantAccountIDs = [1, 2], millisecondsInThePast = 0, isUnread = false): Report {
    return {
        ...getFakeReport(participantAccountIDs, millisecondsInThePast, isUnread),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        policyID: '08CE60F05A5D86E1',
        oldPolicyName: '',
        isOwnPolicyExpenseChat: false,
        ownerAccountID: participantAccountIDs[0],
    };
}

function getFakePolicy(id = '1', name = 'Workspace-Test-001'): Policy {
    return {
        id,
        name,
        isFromFullPolicy: false,
        role: 'admin',
        type: CONST.POLICY.TYPE.TEAM,
        owner: 'myuser@gmail.com',
        outputCurrency: 'BRL',
        avatarURL: '',
        employeeList: {},
        isPolicyExpenseChatEnabled: true,
        lastModified: '1697323926777105',
        autoReporting: true,
        autoReportingFrequency: 'immediate',
        harvesting: {
            enabled: true,
        },
        autoReportingOffset: 1,
        preventSelfApproval: true,
        defaultBillable: false,
        disabledFields: {defaultBillable: true, reimbursable: false},
        approvalMode: 'BASIC',
    };
}

/**
 * @param millisecondsInThePast the number of milliseconds in the past for the last message timestamp (to order reports by most recent messages)
 */
function getFakeAdvancedReportAction(actionName: ReportActionName = 'IOU', actor = 'email1@test.com', millisecondsInThePast = 0): ReportAction {
    return {
        ...getFakeReportAction(actor, millisecondsInThePast),
        actionName,
    } as ReportAction;
}

function MockedSidebarLinks({currentReportID = ''}: MockedSidebarLinksProps) {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, EnvironmentProvider, CurrentReportIDContextProvider]}>
            {/*
             * Only required to make unit tests work, since we
             * explicitly pass the currentReportID in LHNTestUtils
             * to SidebarLinksData, so this context doesn't have an
             * access to currentReportID in that case.
             *
             * So this is a work around to have currentReportID available
             * only in testing environment.
             *  */}
            <ReportIDsContextProvider currentReportIDForTests={currentReportID}>
                <SidebarLinksData
                    onLinkClick={() => {}}
                    insets={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </ReportIDsContextProvider>
        </ComposeProviders>
    );
}

function getDefaultRenderedSidebarLinks(currentReportID = '') {
    // A try-catch block needs to be added to the rendering so that any errors that happen while the component
    // renders are caught and logged to the console. Without the try-catch block, Jest might only report the error
    // as "The above error occurred in your component", without providing specific details. By using a try-catch block,
    // any errors are caught and logged, allowing you to identify the exact error that might be causing a rendering issue
    // when developing tests.

    try {
        // Wrap the SideBarLinks inside of LocaleContextProvider so that all the locale props
        // are passed to the component. If this is not done, then all the locale props are missing
        // and there are a lot of render warnings. It needs to be done like this because normally in
        // our app (App.js) is when the react application is wrapped in the context providers
        render(<MockedSidebarLinks currentReportID={currentReportID} />);
    } catch (error) {
        console.error(error);
    }
}

function internalRender(component: ReactElement) {
    // A try-catch block needs to be added to the rendering so that any errors that happen while the component
    // renders are caught and logged to the console. Without the try-catch block, Jest might only report the error
    // as "The above error occurred in your component", without providing specific details. By using a try-catch block,
    // any errors are caught and logged, allowing you to identify the exact error that might be causing a rendering issue
    // when developing tests.

    try {
        render(component);
    } catch (error) {
        console.error(error);
    }
}

function MockedReportActionItemSingle({shouldShowSubscriptAvatar = true, report, reportAction}: MockedReportActionItemSingleProps) {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, EnvironmentProvider, CurrentReportIDContextProvider]}>
            <ReportActionItemSingle
                action={reportAction}
                report={report}
                showHeader
                shouldShowSubscriptAvatar={shouldShowSubscriptAvatar}
                hasBeenFlagged={false}
                iouReport={undefined}
                isHovered={false}
            />
        </ComposeProviders>
    );
}

function getDefaultRenderedReportActionItemSingle(shouldShowSubscriptAvatar = true, report?: Report, reportAction?: ReportAction) {
    const currentReport = report ?? getFakeReport();
    const currentReportAction = reportAction ?? getFakeAdvancedReportAction();

    internalRender(
        <MockedReportActionItemSingle
            shouldShowSubscriptAvatar={shouldShowSubscriptAvatar}
            report={currentReport}
            reportAction={currentReportAction}
        />,
    );
}

export {
    fakePersonalDetails,
    getDefaultRenderedSidebarLinks,
    getAdvancedFakeReport,
    getFakeReport,
    getFakeReportAction,
    MockedSidebarLinks,
    getDefaultRenderedReportActionItemSingle,
    MockedReportActionItemSingle,
    getFakeReportWithPolicy,
    getFakePolicy,
    getFakeAdvancedReportAction,
};
