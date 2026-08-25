import {render} from '@testing-library/react-native';

import Avatar from '@components/Avatar';
import ListItemComposed from '@components/SelectionList/ListItemComposed';

import CONST from '@src/CONST';
import type {AvatarType, Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';

jest.mock('@components/Avatar', () => jest.fn(() => null));

const mockAvatar = jest.mocked(Avatar);

describe('ListItemComposed.CompactAvatar', () => {
    beforeEach(() => {
        mockAvatar.mockClear();
    });

    it.each([
        ['falls back to the avatar icon type when the icon has none', undefined, CONST.ICON_TYPE_AVATAR],
        ['passes through the workspace icon type', CONST.ICON_TYPE_WORKSPACE, CONST.ICON_TYPE_WORKSPACE],
    ])('%s', (_, type, expectedType) => {
        const icon: Icon = {
            source: 'avatar.png',
            type: type as AvatarType,
            name: 'Test User',
            id: 7,
            fallbackIcon: 'fallback.png',
        };

        render(<ListItemComposed.CompactAvatar icon={icon} />);

        expect(mockAvatar).toHaveBeenCalledTimes(1);
        expect(mockAvatar.mock.calls.at(0)?.at(0)).toEqual(
            expect.objectContaining({
                source: 'avatar.png',
                size: CONST.AVATAR_SIZE.X_SMALL,
                name: 'Test User',
                avatarID: 7,
                type: expectedType,
                fallbackIcon: 'fallback.png',
            }),
        );
    });
});
