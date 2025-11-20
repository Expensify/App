/* eslint-disable @typescript-eslint/naming-convention */
import type * as Navigation from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import type {ReactElement} from 'react';
import React from 'react';
import ComposeProviders from '@components/ComposeProviders';
import {EnvironmentProvider} from '@components/EnvironmentContext';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import {SidebarOrderedReportsContextProvider} from '@hooks/useSidebarOrderedReports';
import DateUtils from '@libs/DateUtils';
import {buildParticipantsFromAccountIDs} from '@libs/ReportUtils';
import ReportActionItemSingle from '@pages/home/report/ReportActionItemSingle';
import SidebarLinksData from '@pages/home/sidebar/SidebarLinksData';
import CONST from '@src/CONST';
import type {PersonalDetailsList, Policy, Report, ReportAction, TransactionViolation, ViolationName} from '@src/types/onyx';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import waitForBatchedUpdatesWithAct from './waitForBatchedUpdatesWithAct';

type MockedReportActionItemSingleProps = {
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
        useNavigationState: () => true,
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
        pronouns: '__predefined_sheHerHers',
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
    10: {
        accountID: 10,
        login: 'email10@test.com',
        displayName: 'Email Ten',
        avatar: 'none',
        firstName: 'Ten',
    },
};

let lastFakeReportID = 0;
let lastFakeReportActionID = 0;
let lastFakeTransactionID = 0;

/**
 * @param millisecondsInThePast the number of milliseconds in the past for the last message timestamp (to order reports by most recent messages)
 */
function getFakeReport(participantAccountIDs = [1, 2], millisecondsInThePast = 0, isUnread = false, adminIDs: number[] = []): Report {
    const lastVisibleActionCreated = DateUtils.getDBTime(Date.now() - millisecondsInThePast);

    const participants = buildParticipantsFromAccountIDs(participantAccountIDs);

    for (const id of adminIDs) {
        participants[id] = {
            notificationPreference: 'always',
            role: CONST.REPORT.ROLE.ADMIN,
        };
    }

    return {
        type: CONST.REPORT.TYPE.CHAT,
        reportID: `${++lastFakeReportID}`,
        reportName: 'Report',
        lastVisibleActionCreated,
        lastReadTime: isUnread ? DateUtils.subtractMillisecondsFromDateTime(lastVisibleActionCreated, 1) : lastVisibleActionCreated,
        participants,
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

function getFakeTransaction(expenseReportID: string, amount = 1, currency: string = CONST.CURRENCY.USD) {
    return {
        transactionID: `${++lastFakeTransactionID}`,
        amount,
        currency,
        reportID: expenseReportID,
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
        ownerAccountID: participantAccountIDs.at(0),
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

function getFakeTransactionViolation(violationName: ViolationName, showInReview = true): TransactionViolation {
    return {
        type: CONST.VIOLATION_TYPES.VIOLATION,
        name: violationName,
        showInReview,
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
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            {/*
             * Only required to make unit tests work, since we
             * explicitly pass the currentReportID in LHNTestUtils
             * to SidebarLinksData, so this context doesn't have an
             * access to currentReportID in that case.
             *
             * So this is a work around to have currentReportID available
             * only in testing environment.
             *  */}
            <SidebarOrderedReportsContextProvider currentReportIDForTests={currentReportID}>
                <SidebarLinksData
                    insets={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </SidebarOrderedReportsContextProvider>
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
        return waitForBatchedUpdatesWithAct();
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

function MockedReportActionItemSingle({report, reportAction}: MockedReportActionItemSingleProps) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, EnvironmentProvider, CurrentReportIDContextProvider]}>
            <ReportActionItemSingle
                action={reportAction}
                report={report}
                showHeader
                hasBeenFlagged={false}
                iouReport={undefined}
                isHovered={false}
            />
        </ComposeProviders>
    );
}

function getDefaultRenderedReportActionItemSingle(report?: Report, reportAction?: ReportAction) {
    const currentReport = report ?? getFakeReport();
    const currentReportAction = reportAction ?? getFakeAdvancedReportAction();

    internalRender(
        <MockedReportActionItemSingle
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
    getFakeTransactionViolation,
    getFakeTransaction,
};
