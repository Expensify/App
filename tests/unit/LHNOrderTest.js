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

const ONYX_KEYS = {
    PERSONAL_DETAILS: 'personalDetails',
    NVP_PREFERRED_LOCALE: 'preferredLocale',
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
        const sidebarLinks = render(<SidebarLinks
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
        />);

        // THEN it should render nothing and be null
        // This is expected because there is an early return when there are no personal details
        expect(sidebarLinks.toJSON()).toBe(null);
    });

    test('is rendered with an empty list when personal details exist', () => {
        // GIVEN the sidebar is rendered with default props
        const sidebarLinks = render(<SidebarLinks
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
        />);

        return waitForPromisesToResolve()
            .then(() => {
                // WHEN Onyx is updated with some personal details
                Onyx.multiSet({
                    [ONYX_KEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [ONYXKEYS.NVP_PREFERRED_LOCALE]: 'en',
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: '1',
                }).then(() => {
                    // THEN the component should be rendered with an empty list since it will get past the early return
                    expect(sidebarLinks.toJSON()).not.toBe(null);
                    expect(sidebarLinks.toJSON().children.length).toBe(2);
                    // console.log(JSON.stringify(sidebarLinks.toJSON()));
                    // @TODO Find which child is the list and make sure it's not rendered
                });
                return waitForPromisesToResolve();
            });
    });
});
