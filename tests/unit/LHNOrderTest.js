import React from 'react';
import Onyx from 'react-native-onyx';

// Note: `react-test-renderer` renderer must be required after react-native.
import {render} from '@testing-library/react-native';
import SidebarLinks from '../../src/pages/home/sidebar/SidebarLinks';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

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
        firstName: 'Email',
    },
};

const fakeReport1 = {
    reportID: 1,
    reportName: 'Report One',
    unreadActionCount: 0,
    lastMessageTimestamp: Date.now(),
    participants: ['email1@test.com'],
};

const fakeReport1Actions = {
    actionName: 'ADDCOMMENT',
    person: [],
    sequenceNumber: 0,
    timestamp: Date.now(),
    message: [
        {type: 'comment', reportID: 1, text: 'Comment One'},
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
            .then(() => {
                // WHEN Onyx is updated with some personal details
                Onyx.multiSet({
                    [ONYX_KEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                }).then(() => {
                    // THEN the component should be rendered with an empty list since it will get past the early return
                    expect(sidebarLinks.toJSON()).not.toBe(null);
                    expect(sidebarLinks.toJSON().children.length).toBe(2);
                    expect(sidebarLinks.getAllByText('Email One').length).toBe(0);
                });
                return waitForPromisesToResolve();
            });
    });

    test('contains one report when a report is in Onyx', () => {
        // GIVEN the sidebar is rendered with default props and we are currently viewing report 1
        const sidebarLinks = getDefaultRenderedSidebarLinks('1');

        return waitForPromisesToResolve()

            // WHEN Onyx is updated with some personal details and a report
            .then(() => Onyx.multiSet({
                [ONYX_KEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                [`${ONYX_KEYS.COLLECTION.REPORT}1`]: fakeReport1,
                [`${ONYX_KEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
            })

                // THEN the component should be rendered with an item for the fake report
                .then(() => {
                    expect(sidebarLinks.toJSON()).not.toBe(null);
                    expect(sidebarLinks.toJSON().children.length).toBe(2);
                    expect(sidebarLinks.getAllByText('Email One').length).toBe(1);
                }));
    });
});
