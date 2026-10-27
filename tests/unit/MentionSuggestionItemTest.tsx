import {render, screen} from '@testing-library/react-native';

import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import Icon from '@components/Icon';
import MentionSuggestionItem from '@components/MentionSuggestions/MentionSuggestionItem';
import type Mention from '@components/MentionSuggestions/types';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/Avatar/AvatarFromIcon', () => jest.fn(() => null));

jest.mock('@components/Icon', () => jest.fn(() => null));

const mockAvatarFromIcon = jest.mocked(AvatarFromIcon);
const mockIcon = jest.mocked(Icon);

const USER_ICON = {
    source: 'avatar.png',
    type: CONST.ICON_TYPE_AVATAR,
    name: 'Test User',
    id: 7,
};

describe('MentionSuggestionItem', () => {
    beforeEach(() => {
        mockAvatarFromIcon.mockClear();
        mockIcon.mockClear();
    });

    it('renders the avatar, display name and handle of a user mention', () => {
        const item: Mention = {
            text: 'Test User',
            alternateText: '@someone',
            handle: 'someone',
            icons: [USER_ICON],
        };

        render(
            <MentionSuggestionItem
                item={item}
                prefix="test"
            />,
        );

        expect(mockAvatarFromIcon).toHaveBeenCalledTimes(1);
        expect(mockAvatarFromIcon.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({icon: USER_ICON}));
        expect(mockIcon).not.toHaveBeenCalled();
        expect(screen.getByText('Test User')).toBeOnTheScreen();
        expect(screen.getByText('@someone')).toBeOnTheScreen();
    });

    it('renders a plain success-colored icon instead of an avatar for the @here mention', () => {
        const item: Mention = {
            text: CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT,
            alternateText: 'Notify everyone online in this room',
            icons: [USER_ICON],
        };

        render(
            <MentionSuggestionItem
                item={item}
                prefix="he"
            />,
        );

        expect(mockAvatarFromIcon).not.toHaveBeenCalled();
        expect(mockIcon).toHaveBeenCalledTimes(1);
        expect(screen.getByText(CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT)).toBeOnTheScreen();
    });

    it('does not repeat the handle when it matches the display text', () => {
        const item: Mention = {
            text: '@someone',
            alternateText: '@someone',
            icons: [USER_ICON],
        };

        render(
            <MentionSuggestionItem
                item={item}
                prefix="some"
            />,
        );

        expect(screen.getAllByText('@someone')).toHaveLength(1);
    });
});
