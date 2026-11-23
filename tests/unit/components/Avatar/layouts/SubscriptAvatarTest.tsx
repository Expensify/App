import {render, screen} from '@testing-library/react-native';

import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';

const USER_ICON: Icon = {id: 1, name: 'Alice', source: 'https://example.com/alice.png', type: CONST.ICON_TYPE_AVATAR};
const WORKSPACE_ICON: Icon = {id: 'AAAA1111', name: 'Workspace', source: 'https://example.com/workspace.png', type: CONST.ICON_TYPE_WORKSPACE};

// Stand in for the avatar image, whose own rendering is covered elsewhere, so only the subscript layout is under test.
jest.mock('@components/Avatar/AvatarFromIcon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns an untyped module object
    const {View} = require('react-native');
    return ({testID}: {testID: string}) => <View testID={testID} />;
});

describe('SubscriptAvatar', () => {
    it('should apply `containerStyle` on top of the default subscript layout', () => {
        // Given a caller that needs to drop the default right margin, as a row with its own spacing does
        // When the subscript avatar renders with that override
        render(
            <SubscriptAvatar
                primaryAvatar={USER_ICON}
                secondaryAvatar={WORKSPACE_ICON}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={{marginRight: 0}}
            />,
        );

        // Then the override wins over the default margin while the default footprint is kept, so callers can adjust spacing without redoing the layout
        const container = screen.getByTestId('Avatar-Subscript');
        expect(container).toHaveStyle({marginRight: 0});
        expect(container).toHaveStyle({width: variables.avatarSizeMedium, height: variables.avatarSizeMedium});
    });

    it('should keep the default right margin when no `containerStyle` is passed', () => {
        // Given a caller that relies on the default spacing next to the avatar
        // When the subscript avatar renders without an override
        render(
            <SubscriptAvatar
                primaryAvatar={USER_ICON}
                secondaryAvatar={WORKSPACE_ICON}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the default margin is still there, so the override in the other test is what removes it
        expect(screen.getByTestId('Avatar-Subscript')).toHaveStyle({marginRight: variables.avatarChatSpacing});
    });
});
