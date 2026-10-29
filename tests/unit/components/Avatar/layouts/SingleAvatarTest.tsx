import {render, screen} from '@testing-library/react-native';

import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import type {AvatarIcon} from '@components/Avatar/types';

import CONST from '@src/CONST';

import type {PropsWithChildren} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

const AVATAR_CONTAINER_STYLE = {borderRadius: 20};
const WRAPPER_STYLE = {marginRight: 12};

const AVATAR: AvatarIcon = {
    source: 'https://example.com/avatar.png',
    type: CONST.ICON_TYPE_AVATAR,
    id: 123,
    name: 'Alice',
};

// Render the tooltip as a passthrough so the host tree starts at the `AvatarTooltip` wrapper `View`, which is the tooltip's hover and measure target.
jest.mock('@components/UserDetailsTooltip', () => ({
    __esModule: true,
    default: ({children}: PropsWithChildren) => children,
}));

jest.mock('@components/Avatar/AvatarFromIcon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns an untyped module object
    const {View} = require('react-native');
    return ({containerStyles, testID}: {containerStyles: StyleProp<ViewStyle>; testID: string}) => (
        <View
            testID={testID}
            style={containerStyles}
        />
    );
});

describe('SingleAvatar', () => {
    it('should apply `style` to the tooltip wrapper and `containerStyles` to the avatar', () => {
        // Given an avatar with outer spacing passed through `style`, as the LHN row does
        // When it renders
        render(
            <SingleAvatar
                avatar={AVATAR}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyles={AVATAR_CONTAINER_STYLE}
                style={WRAPPER_STYLE}
            />,
        );

        // Then the margin sits on the tooltip wrapper, so the tooltip target is only as wide as the avatar and the tooltip centers on it
        const avatar = screen.getByTestId('SingleAvatar');
        expect(screen.root).toContainElement(avatar);
        expect(screen.root).toHaveStyle(WRAPPER_STYLE);
        expect(avatar).toHaveStyle(AVATAR_CONTAINER_STYLE);
        expect(avatar).not.toHaveStyle(WRAPPER_STYLE);
    });
});
