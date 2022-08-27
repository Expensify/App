import 'react-native';
import React from 'react';
import Onyx from 'react-native-onyx';

// Note: `react-test-renderer` renderer must be required after react-native.
import {render} from '@testing-library/react-native';
import SidebarLinks from '../../src/pages/home/sidebar/SidebarLinks';
import ONYXKEYS from '../../src/ONYXKEYS';

const fakeInsets = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

const ONYX_KEYS = {
    PERSONAL_DETAILS: 'personalDetails',
    NVP_PREFERRED_LOCALE: 'preferredLocale',
};

Onyx.init({
    keys: ONYX_KEYS,
    registerStorageEventListener: () => {},
});

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
            translate={thing => thing}
        />);
        expect(sideBarLinks.toJSON()).toBe(null);
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
        });
        expect(sideBarLinks.toJSON()).not.toBe(null);
    });
});
