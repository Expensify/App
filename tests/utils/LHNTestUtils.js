import React from 'react';
import PropTypes from 'prop-types';
import {render} from '@testing-library/react-native';
import ComposeProviders from '../../src/components/ComposeProviders';
import OnyxProvider from '../../src/components/OnyxProvider';
import {LocaleContextProvider} from '../../src/components/withLocalize';
import SidebarLinks from '../../src/pages/home/sidebar/SidebarLinks';
import CONST from '../../src/CONST';
import DateUtils from '../../src/libs/DateUtils';

const fakePersonalDetails = {
    'email1@test.com': {
        login: 'email1@test.com',
        displayName: 'Email One',
        avatar: 'none',
        firstName: 'One',
    },
    'email2@test.com': {
        login: 'email2@test.com',
        displayName: 'Email Two',
        avatar: 'none',
        firstName: 'Two',
    },
    'email3@test.com': {
        login: 'email3@test.com',
        displayName: 'Email Three',
        avatar: 'none',
        firstName: 'Three',
    },
    'email4@test.com': {
        login: 'email4@test.com',
        displayName: 'Email Four',
        avatar: 'none',
        firstName: 'Four',
    },
    'email5@test.com': {
        login: 'email5@test.com',
        displayName: 'Email Five',
        avatar: 'none',
        firstName: 'Five',
    },
    'email6@test.com': {
        login: 'email6@test.com',
        displayName: 'Email Six',
        avatar: 'none',
        firstName: 'Six',
    },
    'email7@test.com': {
        login: 'email7@test.com',
        displayName: 'Email Seven',
        avatar: 'none',
        firstName: 'Seven',
    },
    'email8@test.com': {
        login: 'email8@test.com',
        displayName: 'Email Eight',
        avatar: 'none',
        firstName: 'Eight',
    },
    'email9@test.com': {
        login: 'email9@test.com',
        displayName: 'Email Nine',
        avatar: 'none',
        firstName: 'Nine',
    },
};

let lastFakeReportID = 0;
let lastFakeReportActionID = 0;

/**
 * @param {String[]} participants
 * @param {Number} millisecondsInThePast the number of milliseconds in the past for the last message timestamp (to order reports by most recent messages)
 * @param {boolean} isUnread
 * @returns {Object}
 */
function getFakeReport(participants = ['email1@test.com', 'email2@test.com'], millisecondsInThePast = 0, isUnread = false) {
    const lastVisibleActionCreated = DateUtils.getDBTime(Date.now() - millisecondsInThePast);
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
        whisperedTo: [],
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
        ...getFakeReport(['email1@test.com', 'email2@test.com'], 0, isUnread),
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
 * @param {String} [reportIDFromRoute]
 */
function getDefaultRenderedSidebarLinks(reportIDFromRoute = '') {
    // An ErrorBoundary needs to be added to the rendering so that any errors that happen while the component
    // renders are logged to the console. Without an error boundary, Jest only reports the error like "The above error
    // occurred in your component", except, there is no "above error". It's just swallowed up by Jest somewhere.
    // With the ErrorBoundary, those errors are caught and logged to the console so you can find exactly which error
    // might be causing a rendering issue when developing tests.
    class ErrorBoundary extends React.Component {
        // Error boundaries have to implement this method. It's for providing a fallback UI, but
        // we don't need that for unit testing, so this is basically a no-op.
        static getDerivedStateFromError(error) {
            return {error};
        }

        componentDidCatch(error, errorInfo) {
            console.error(error, errorInfo);
        }

        render() {
            // eslint-disable-next-line react/prop-types
            return this.props.children;
        }
    }

    // Wrap the SideBarLinks inside of LocaleContextProvider so that all the locale props
    // are passed to the component. If this is not done, then all the locale props are missing
    // and there are a lot of render warnings. It needs to be done like this because normally in
    // our app (App.js) is when the react application is wrapped in the context providers
    render(
        <ErrorBoundary>
            <MockedSidebarLinks reportIDFromRoute={reportIDFromRoute} />
        </ErrorBoundary>,
    );
}

/**
 * @param {String} [reportIDFromRoute]
 * @returns {JSX.Element}
 */
function MockedSidebarLinks({reportIDFromRoute}) {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider]}>
            <SidebarLinks
                onLinkClick={() => {}}
                insets={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
                isSmallScreenWidth={false}
                reportIDFromRoute={reportIDFromRoute}
            />
        </ComposeProviders>
    );
}

MockedSidebarLinks.propTypes = {
    reportIDFromRoute: PropTypes.string,
};

MockedSidebarLinks.defaultProps = {
    reportIDFromRoute: '',
};

export {fakePersonalDetails, getDefaultRenderedSidebarLinks, getAdvancedFakeReport, getFakeReport, getFakeReportAction, MockedSidebarLinks};
