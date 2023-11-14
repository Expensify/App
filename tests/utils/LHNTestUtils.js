import {render} from '@testing-library/react-native';
import PropTypes from 'prop-types';
import React from 'react';
import ComposeProviders from '../../src/components/ComposeProviders';
import {LocaleContextProvider} from '../../src/components/LocaleContextProvider';
import OnyxProvider from '../../src/components/OnyxProvider';
import {CurrentReportIDContextProvider} from '../../src/components/withCurrentReportID';
import {EnvironmentProvider} from '../../src/components/withEnvironment';
import CONST from '../../src/CONST';
import DateUtils from '../../src/libs/DateUtils';
import ReportActionItemSingle from '../../src/pages/home/report/ReportActionItemSingle';
import reportActionPropTypes from '../../src/pages/home/report/reportActionPropTypes';
import SidebarLinksData from '../../src/pages/home/sidebar/SidebarLinksData';
import reportPropTypes from '../../src/pages/reportPropTypes';

// we have to mock `useIsFocused` because it's used in the SidebarLinks component
const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => ({
            navigate: mockedNavigate,
        }),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: jest.fn(),
        }),
        createNavigationContainerRef: jest.fn(),
    };
});

const fakePersonalDetails = {
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
 * @param {Number[]} participantAccountIDs
 * @param {Number} millisecondsInThePast the number of milliseconds in the past for the last message timestamp (to order reports by most recent messages)
 * @param {boolean} isUnread
 * @returns {Object}
 */
function getFakeReport(participantAccountIDs = [1, 2], millisecondsInThePast = 0, isUnread = false) {
    const lastVisibleActionCreated = DateUtils.getDBTime(Date.now() - millisecondsInThePast);
    return {
        type: CONST.REPORT.TYPE.CHAT,
        reportID: `${++lastFakeReportID}`,
        reportName: 'Report',
        lastVisibleActionCreated,
        lastReadTime: isUnread ? DateUtils.subtractMillisecondsFromDateTime(lastVisibleActionCreated, 1) : lastVisibleActionCreated,
        participantAccountIDs,
    };
}

/**
 * @param {String} actor
 * @param {Number} millisecondsInThePast the number of milliseconds in the past for the last message timestamp (to order reports by most recent messages)
 * @returns {Object}
 */
function getFakeReportAction(actor = 'email1@test.com', millisecondsInThePast = 0) {
    const timestamp = DateUtils.getDBTime(Date.now() - millisecondsInThePast);

    return {
        actor,
        actorAccountID: 1,
        reportActionID: `${++lastFakeReportActionID}`,
        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        shouldShow: true,
        timestamp,
        reportActionTimestamp: timestamp,
        person: [
            {
                type: 'TEXT',
                style: 'strong',
                text: 'Email One',
            },
        ],
        whisperedToAccountIDs: [],
        automatic: false,
        message: [
            {
                type: 'COMMENT',
                html: 'hey',
                text: 'hey',
                isEdited: false,
                whisperedTo: [],
                isDeletedParentAction: false,
                reactions: [
                    {
                        emoji: 'heart',
                        users: [
                            {
                                accountID: 1,
                                skinTone: -1,
                            },
                        ],
                    },
                ],
            },
        ],
        originalMessage: {
            childReportID: `${++lastFakeReportActionID}`,
            emojiReactions: {
                heart: {
                    createdAt: '2023-08-28 15:27:52',
                    users: {
                        1: {
                            skinTones: {
                                '-1': '2023-08-28 15:27:52',
                            },
                        },
                    },
                },
            },
            html: 'hey',
            lastModified: '2023-08-28 15:28:12.432',
            reactions: [
                {
                    emoji: 'heart',
                    users: [
                        {
                            accountID: 1,
                            skinTone: -1,
                        },
                    ],
                },
            ],
        },
    };
}

/**
 * There is one setting not represented here, which is hasOutstandingIOU. In order to test that setting, there must be
 * additional reports in Onyx, so it's being left out for now.
 *
 * @param {boolean} isArchived
 * @param {boolean} isUserCreatedPolicyRoom
 * @param {boolean} hasAddWorkspaceError
 * @param {boolean} isUnread
 * @param {boolean} isPinned
 * @param {boolean} hasDraft
 * @returns {Object}
 */
function getAdvancedFakeReport(isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned, hasDraft) {
    return {
        ...getFakeReport([1, 2], 0, isUnread),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: isUserCreatedPolicyRoom ? CONST.REPORT.CHAT_TYPE.POLICY_ROOM : CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        statusNum: isArchived ? CONST.REPORT.STATUS.CLOSED : 0,
        stateNum: isArchived ? CONST.REPORT.STATE_NUM.SUBMITTED : 0,
        errorFields: hasAddWorkspaceError ? {addWorkspaceRoom: 'blah'} : null,
        isPinned,
        hasDraft,
    };
}

/**
 * @param {Number[]} [participantAccountIDs]
 * @param {Number} [millisecondsInThePast] the number of milliseconds in the past for the last message timestamp (to order reports by most recent messages)
 * @param {boolean} [isUnread]
 * @returns {Object}
 */
function getFakeReportWithPolicy(participantAccountIDs = [1, 2], millisecondsInThePast = 0, isUnread = false) {
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

/**
 * @param {Number} [id]
 * @param {String} [name]
 * @returns {Object}
 */
function getFakePolicy(id = 1, name = 'Workspace-Test-001') {
    return {
        id,
        name,
        isFromFullPolicy: false,
        role: 'admin',
        type: 'free',
        owner: 'myuser@gmail.com',
        outputCurrency: 'BRL',
        avatar: '',
        employeeList: [],
        isPolicyExpenseChatEnabled: true,
        areChatRoomsEnabled: true,
        lastModified: 1697323926777105,
        autoReporting: true,
        autoReportingFrequency: 'immediate',
        defaultBillable: false,
        disabledFields: {defaultBillable: true, reimbursable: false},
    };
}

/**
 * @param {String} actionName
 * @param {String} actor
 * @param {Number} millisecondsInThePast the number of milliseconds in the past for the last message timestamp (to order reports by most recent messages)
 * @returns {Object}
 */
function getFakeAdvancedReportAction(actionName = 'IOU', actor = 'email1@test.com', millisecondsInThePast = 0) {
    return {
        ...getFakeReportAction(actor, millisecondsInThePast),
        actionName,
    };
}

/**
 * @param {String} [currentReportID]
 */
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

/**
 * @param {String} [currentReportID]
 * @returns {JSX.Element}
 */
function MockedSidebarLinks({currentReportID}) {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, EnvironmentProvider, CurrentReportIDContextProvider]}>
            <SidebarLinksData
                onLinkClick={() => {}}
                insets={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
                isSmallScreenWidth={false}
                currentReportID={currentReportID}
            />
        </ComposeProviders>
    );
}

MockedSidebarLinks.propTypes = {
    currentReportID: PropTypes.string,
};

MockedSidebarLinks.defaultProps = {
    currentReportID: '',
};

/**
 * @param {React.ReactElement} component
 */
function internalRender(component) {
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

/**
 * @param {Boolean} [shouldShowSubscriptAvatar]
 * @param {Object} [report]
 * @param {Object} [reportAction]
 */
function getDefaultRenderedReportActionItemSingle(shouldShowSubscriptAvatar = true, report = null, reportAction = null) {
    const currentReport = report || getFakeReport();
    const currentReportAction = reportAction || getFakeAdvancedReportAction();

    internalRender(
        <MockedReportActionItemSingle
            shouldShowSubscriptAvatar={shouldShowSubscriptAvatar}
            report={currentReport}
            reportAction={currentReportAction}
        />,
    );
}

/**
 * @param {Boolean} shouldShowSubscriptAvatar
 * @param {Object} report
 * @param {Object} reportAction
 * @returns {JSX.Element}
 */
function MockedReportActionItemSingle({shouldShowSubscriptAvatar, report, reportAction}) {
    const personalDetailsList = {
        [reportAction.actorAccountID]: {
            accountID: reportAction.actorAccountID,
            login: 'email1@test.com',
            displayName: 'Email One',
            avatar: 'https://example.com/avatar.png',
            firstName: 'One',
        },
    };

    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, EnvironmentProvider, CurrentReportIDContextProvider]}>
            <ReportActionItemSingle
                action={reportAction}
                report={report}
                personalDetailsList={personalDetailsList}
                wrapperStyles={[{display: 'inline'}]}
                showHeader
                shouldShowSubscriptAvatar={shouldShowSubscriptAvatar}
                hasBeenFlagged={false}
                iouReport={undefined}
                isHovered={false}
            />
        </ComposeProviders>
    );
}

MockedReportActionItemSingle.propTypes = {
    shouldShowSubscriptAvatar: PropTypes.bool,
    report: reportPropTypes,
    reportAction: PropTypes.shape(reportActionPropTypes),
};

MockedReportActionItemSingle.defaultProps = {
    shouldShowSubscriptAvatar: true,
    report: null,
    reportAction: null,
};

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
