import React from 'react';
import Onyx from 'react-native-onyx';

// Note: `react-test-renderer` renderer must be required after react-native.
import {render} from '@testing-library/react-native';
import SidebarLinks from '../../src/pages/home/sidebar/SidebarLinks';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

// This will swallow up all proptype warnings and keep them from being output to the console.
// It is helpful when developing tests to have minimal output.
// Due to the heave usage of HOCs (specifically the language locale ones) it becomes
// very difficult to mock everything enough to prevent all proptype warnings.
// Be careful with this though because some components won't render if the proptypes are wrong.
// This should always be set to false for Travis tests.
const SUPPRESS_PROPTYPE_WARNINGS = true;

if (SUPPRESS_PROPTYPE_WARNINGS) {
    const sidebarLinksErrors = console.error.bind(console);
    beforeAll(() => {
        console.error = (errormessage) => {
            const suppressedErrors = errormessage
                .toString()
                .includes('Warning: Failed %s type: %s%s');
            return !suppressedErrors && sidebarLinksErrors(errormessage);
        };
    });
    afterAll(() => {
        console.error = sidebarLinksErrors;
    });
}

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
        firstName: 'Email1',
    },
    'email2@test.com': {
        login: 'email2@test.com',
        displayName: 'Email Two',
        avatar: 'none',
        firstName: 'Email2',
    },
    'email3@test.com': {
        login: 'email3@test.com',
        displayName: 'Email Three',
        avatar: 'none',
        firstName: 'Email3',
    },
    'email4@test.com': {
        login: 'email4@test.com',
        displayName: 'Email Four',
        avatar: 'none',
        firstName: 'Email4',
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

function getDefaultRenderedSidebarLinks(currentlyViewedReportID = '') {
    return render(<SidebarLinks
        onLinkClick={() => {}}
        insets={fakeInsets}
        onAvatarClick={() => {}}
        isSmallScreenWidth
        toLocaleDigit={() => {}}
        fromLocaleDigit={() => {}}
        fromLocalPhone={() => {}}
        toLocalPhone={() => {}}
        timestampToDateTime={() => {}}
        timestampToRelative={() => {}}
        numberFormat={() => {}}
        translate={thing => thing}
        currentlyViewedReportID={currentlyViewedReportID}
    />);
}

// Icons need to be explicitly mocked. The testing library throws an error when trying to render them
jest.mock('../../src/components/Icon/Expensicons', () => ({MagnifyingGlass: () => ''}));

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
                expect(sidebarLinks.queryAllByText('Email1, Email2')).toHaveLength(0);
            });
    });

    test('contains one report when a report is in Onyx', () => {
        // GIVEN the sidebar is rendered while currently viewing report 1
        const sidebarLinks = getDefaultRenderedSidebarLinks('1');

        return waitForPromisesToResolve()

            // WHEN Onyx is updated with some personal details and a report
            .then(() => Onyx.multiSet({
                [ONYX_KEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                [`${ONYX_KEYS.COLLECTION.REPORT}1`]: fakeReport1,
                [`${ONYX_KEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
            }))

            // THEN the component should be rendered with an item for the fake report
            .then(() => {
                expect(sidebarLinks.toJSON()).not.toBe(null);
                expect(sidebarLinks.toJSON().children.length).toBe(2);
                expect(sidebarLinks.getAllByText('Email1, Email2')).toHaveLength(1);
            });
    });

    test('orders items with most recently updated on top', () => {
        // GIVEN the sidebar is rendered while currently viewing report 1
        const sidebarLinks = getDefaultRenderedSidebarLinks('1');

        return waitForPromisesToResolve()

            // WHEN Onyx is updated with some personal details and multiple reports
            .then(() => Onyx.multiSet({
                [ONYX_KEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                [`${ONYX_KEYS.COLLECTION.REPORT}1`]: fakeReport1,
                [`${ONYX_KEYS.COLLECTION.REPORT}2`]: fakeReport2,
                [`${ONYX_KEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                [`${ONYX_KEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
            }))

            // THEN the component should be rendered with the mostly recently updated report first
            .then(() => {
                expect(sidebarLinks.toJSON()).not.toBe(null);
                expect(sidebarLinks.toJSON().children.length).toBe(2);
                const reportOptions = sidebarLinks.getAllByText(/Email(1|3), Email(2|4)/);
                expect(reportOptions).toHaveLength(2);

                // The report with participants 3 and 4 should be first (on the top) since
                // it has the most recent lastMessageTimestamp
                expect(reportOptions[0].children[0].props.children).toBe('Email3, Email4');
                expect(reportOptions[1].children[0].props.children).toBe('Email1, Email2');
            });
    });
});
