import 'react-native';
import React from 'react';

// Note: `react-test-renderer` renderer must be required after react-native.
import {render} from '@testing-library/react-native';
import SideBarLinks from '../../src/pages/home/sidebar/SidebarLinks';

const fakeInsets = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

describe('Sidebar', () => {
    test('is not rendered when there are no props passed to it', () => {
        const sideBarLinks = render(<SideBarLinks />);
        sideBarLinks.debug();
        expect(sideBarLinks.toJSON()).toBe(null);
    });

    // test('is not rendered when there are no props passed to it', () => {
    //     let sideBarLinks;
    //     act(() => {
    //         sideBarLinks = create(<SideBarLinks
    //             onLinkClick={() => {}}
    //             insets={fakeInsets}
    //             onAvatarClick={() => {}}
    //             isSmallScreenWidth
    //         />);
    //     });
    //     expect(sideBarLinks.toJSON()).toBe(null);
    //     act(() => {
    //         sideBarLinks.update(<SideBarLinks
    //             onLinkClick={() => {}}
    //             insets={fakeInsets}
    //             onAvatarClick={() => {}}
    //             isSmallScreenWidth
    //             personalDetails={{
    //                 'email1@test.com': {
    //                     login: 'email1@test.com',
    //                     displayName: 'Email One',
    //                     avatar: 'none',
    //                     firstName: 'Email',
    //                 },
    //             }}
    //         />);
    //     });
    //     expect(sideBarLinks.toJSON()).not.toBe(null);
    // });
});
