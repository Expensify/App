import React from 'react';
import Onyx from 'react-native-onyx';
import {render} from '@testing-library/react-native';
import SidebarLinks from '../../src/pages/home/sidebar/SidebarLinks';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import {LocaleContextProvider} from '../../src/components/withLocalize';

const fakeInsets = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

const fakePersonalDetails = {
    'email1@test.com': {
        login: 'email1@test.com',
        displayName: 'Email One',
        avatar: 'none',
        firstName: 'ReportID',
    },
    'email2@test.com': {
        login: 'email2@test.com',
        displayName: 'Email Two',
        avatar: 'none',
        firstName: 'One',
    },
    'email3@test.com': {
        login: 'email3@test.com',
        displayName: 'Email Three',
        avatar: 'none',
        firstName: 'ReportID',
    },
    'email4@test.com': {
        login: 'email4@test.com',
        displayName: 'Email Four',
        avatar: 'none',
        firstName: 'Two',
    },
};

const fakeReport1 = {
    reportID: 1,
    reportName: 'Report One',
    unreadActionCount: 0,

    // This report's last comment will be in the past
    lastMessageTimestamp: Date.now() - 1000,
    participants: ['email1@test.com', 'email2@test.com'],
};
const fakeReport2 = {
    reportID: 2,
    reportName: 'Report Two',
    unreadActionCount: 0,
    lastMessageTimestamp: Date.now(),
    participants: ['email3@test.com', 'email4@test.com'],
};

const fakeReport1Actions = {
    actionName: 'ADDCOMMENT',
    person: [],
    sequenceNumber: 0,

    // This comment will be in the past
    timestamp: Date.now() - 1000,
    message: [
        {type: 'comment', reportID: 1, text: 'Comment One'},
    ],
};
const fakeReport2Actions = {
    actionName: 'ADDCOMMENT',
    person: [],
    sequenceNumber: 0,
    timestamp: Date.now(),
    message: [
        {type: 'comment', reportID: 2, text: 'Comment Two'},
    ],
};

const ONYX_KEYS = {
    PERSONAL_DETAILS: 'personalDetails',
    CURRENTLY_VIEWED_REPORTID: 'currentlyViewedReportID',
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
        REPORTS_WITH_DRAFT: 'reportWithDraft_',
    },
};

Onyx.init({
    keys: ONYX_KEYS,
    registerStorageEventListener: () => {},
});

jest.disableAutomock();

function getDefaultRenderedSidebarLinks() {
    // Wrap the SideBarLinks inside of LocaleContextProvider so that all the locale props
    // are passed to the component. If this is not done, then all the locale props are missing
    // and there are a lot of render warnings. It needs to be done like this because normally in
    // our app (App.js) is when the react application is wrapped in the context providers
    return render((
        <LocaleContextProvider>
            <SidebarLinks
                onLinkClick={() => {}}
                insets={fakeInsets}
                onAvatarClick={() => {}}
                isSmallScreenWidth
            />
        </LocaleContextProvider>
    ));
}

// Icons need to be explicitly mocked. The testing library throws an error when trying to render them
jest.mock('../../src/components/Icon/Expensicons', () => ({
    MagnifyingGlass: () => '',
    Pencil: () => '',
}));

// Clear out Onyx after each test so that each test starts with a clean slate
afterEach(() => {
    Onyx.clear();
    return waitForPromisesToResolve();
});

describe('Sidebar', () => {
    test('is not rendered when there are no props passed to it', () => {
        // GIVEN all the default props are passed to SidebarLinks
        // WHEN it is rendered
        const sidebarLinks = getDefaultRenderedSidebarLinks();

        // THEN it should render nothing and be null
        // This is expected because there is an early return when there are no personal details
        expect(sidebarLinks.toJSON()).toBe(null);
    });

    test('is rendered with an empty list when personal details exist', () => {
        // GIVEN the sidebar is rendered with default props
        const sidebarLinks = getDefaultRenderedSidebarLinks();

        return waitForPromisesToResolve()

            // WHEN Onyx is updated with some personal details
            .then(() => Onyx.multiSet({
                [ONYX_KEYS.PERSONAL_DETAILS]: fakePersonalDetails,
            }))

            // THEN the component should be rendered with an empty list since it will get past the early return
            .then(() => {
                expect(sidebarLinks.toJSON()).not.toBe(null);
                expect(sidebarLinks.toJSON().children.length).toBe(2);
                expect(sidebarLinks.queryAllByText('ReportID, One')).toHaveLength(0);
            });
    });

    test('contains one report when a report is in Onyx', () => {
        // GIVEN the sidebar is rendered while currently viewing report 1
        const sidebarLinks = getDefaultRenderedSidebarLinks();

        return waitForPromisesToResolve()

            // WHEN Onyx is updated with some personal details and a report
            .then(() => Onyx.multiSet({
                [ONYX_KEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                [ONYX_KEYS.CURRENTLY_VIEWED_REPORTID]: '1',
                [`${ONYX_KEYS.COLLECTION.REPORT}1`]: fakeReport1,
                [`${ONYX_KEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
            }))

            // THEN the component should be rendered with an item for the fake report
            .then(() => {
                expect(sidebarLinks.toJSON()).not.toBe(null);
                expect(sidebarLinks.toJSON().children.length).toBe(2);
                expect(sidebarLinks.getAllByText('ReportID, One')).toHaveLength(1);
            });
    });

    test('orders items with most recently updated on top', () => {
        // GIVEN the sidebar is rendered while currently viewing report 1
        const sidebarLinks = getDefaultRenderedSidebarLinks();

        return waitForPromisesToResolve()

            // WHEN Onyx is updated with some personal details and multiple reports
            .then(() => Onyx.multiSet({
                [ONYX_KEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                [ONYX_KEYS.CURRENTLY_VIEWED_REPORTID]: '1',
                [`${ONYX_KEYS.COLLECTION.REPORT}1`]: fakeReport1,
                [`${ONYX_KEYS.COLLECTION.REPORT}2`]: fakeReport2,
                [`${ONYX_KEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                [`${ONYX_KEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
            }))

            // THEN the component should be rendered with the mostly recently updated report first
            .then(() => {
                expect(sidebarLinks.toJSON()).not.toBe(null);
                expect(sidebarLinks.toJSON().children.length).toBe(2);
                const reportOptions = sidebarLinks.getAllByText(/ReportID, (One|Two)/);
                expect(reportOptions).toHaveLength(2);

                // reportID=2 should be first (on the top) since it has the most recent lastMessageTimestamp
                expect(reportOptions[0].children[0].props.children).toBe('ReportID, Two');
                expect(reportOptions[1].children[0].props.children).toBe('ReportID, One');
            })

            // WHEN there exists a draft on report1 (the report at the bottomom of the list)
            .then(Onyx.multiSet({
                [`${ONYX_KEYS.COLLECTION.REPORTS_WITH_DRAFT}1`]: true,
            }))

            // THEN the order of the reports should not change and
            .then(() => {
                const reportOptions = sidebarLinks.getAllByText(/ReportID, (One|Two)/);
                expect(reportOptions).toHaveLength(2);

                // reportID=2 should be first (on the top) since it has the most recent lastMessageTimestamp
                expect(reportOptions[0].children[0].props.children).toBe('ReportID, Two');
                expect(reportOptions[1].children[0].props.children).toBe('ReportID, One');
            });
    });
});
