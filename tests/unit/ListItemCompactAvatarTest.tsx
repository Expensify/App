import {render} from '@testing-library/react-native';

import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import ListItemComposed from '@components/SelectionList/ListItemComposed';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';

jest.mock('@components/Avatar/AvatarFromIcon', () => jest.fn(() => null));

const mockAvatarFromIcon = jest.mocked(AvatarFromIcon);

describe('ListItemComposed.CompactAvatar', () => {
    beforeEach(() => {
        mockAvatarFromIcon.mockClear();
    });

    it('forwards the icon to the avatar', () => {
        const icon: Icon = {
            source: 'avatar.png',
            type: CONST.ICON_TYPE_AVATAR,
            name: 'Test User',
            id: 7,
            fallbackIcon: 'fallback.png',
        };

        render(<ListItemComposed.CompactAvatar icon={icon} />);

        expect(mockAvatarFromIcon).toHaveBeenCalledTimes(1);
        expect(mockAvatarFromIcon.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({icon}));
    });
});
