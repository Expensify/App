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

describe('Sidebar', () => {
    test('is not rendered when there are no props passed to it', () => {
        const sideBarLinks = render(<SidebarLinks
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
            translate={() => {}}
        />);
        expect(sideBarLinks.toJSON()).toBe(null);
    });

    test('is rendered with an empty list when personal details exist', () => {
        const sideBarLinks = render(<SidebarLinks
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
        expect(sideBarLinks.toJSON()).toBe(null);
        return waitForPromisesToResolve()
            .then(() => {
                Onyx.multiSet({
                    [ONYX_KEYS.PERSONAL_DETAILS]: {
                        'email1@test.com': {
                            login: 'email1@test.com',
                            displayName: 'Email One',
                            avatar: 'none',
                            firstName: 'Email',
                        },
                    },
                    [ONYXKEYS.NVP_PREFERRED_LOCALE]: 'en',
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: '1',
                }).then(() => {
                    expect(sideBarLinks.toJSON()).not.toBe(null);
                });
                return waitForPromisesToResolve();
            });
    });
});
