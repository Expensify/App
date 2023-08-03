import React from 'react';
import PropTypes from 'prop-types';
import {render} from '@testing-library/react-native';
import ComposeProviders from '../../src/components/ComposeProviders';
import OnyxProvider from '../../src/components/OnyxProvider';
import {LocaleContextProvider} from '../../src/components/withLocalize';
import SidebarLinksData from '../../src/pages/home/sidebar/SidebarLinksData';
import {EnvironmentProvider} from '../../src/components/withEnvironment';
import CONST from '../../src/CONST';
import DateUtils from '../../src/libs/DateUtils';

// we have to mock `useIsFocused` because it's used in the SidebarLinks component
const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
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
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, EnvironmentProvider]}>
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

export {fakePersonalDetails, getDefaultRenderedSidebarLinks, getAdvancedFakeReport, getFakeReport, getFakeReportAction, MockedSidebarLinks};
