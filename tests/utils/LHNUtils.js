import React from 'react';
import {render} from '@testing-library/react-native';
import {LocaleContextProvider} from '../../src/components/withLocalize';
import SidebarLinks from '../../src/pages/home/sidebar/SidebarLinks';

const TEST_MAX_SEQUENCE_NUMBER = 10;

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

/**
 * @param {String[]} participants
 * @returns {Object}
 */
function getFakeReport(participants = []) {
    return {
        reportID: ++lastFakeReportID,
        reportName: 'Report',
        maxSequenceNumber: TEST_MAX_SEQUENCE_NUMBER,
        lastReadSequenceNumber: TEST_MAX_SEQUENCE_NUMBER,
        lastMessageTimestamp: Date.now(),
        participants,
    };
}

function getDefaultRenderedSidebarLinks() {
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
    return render((
        <LocaleContextProvider>
            <ErrorBoundary>
                <SidebarLinks
                    onLinkClick={() => {}}
                    insets={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                    onAvatarClick={() => {}}
                    isSmallScreenWidth={false}
                />
            </ErrorBoundary>
        </LocaleContextProvider>
    ));
}

export {
    fakePersonalDetails,
    getDefaultRenderedSidebarLinks,
    getFakeReport,
    TEST_MAX_SEQUENCE_NUMBER,
};
