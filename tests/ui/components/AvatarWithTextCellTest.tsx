import {render, screen} from '@testing-library/react-native';

import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import AvatarWithTextCell from '@components/Search/SearchList/ListItem/AvatarWithTextCell';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';

jest.mock('@components/Avatar/AvatarFromIcon', () => jest.fn(() => null));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        flexRow: {},
        alignItemsCenter: {},
        pr2: {},
        userSelectNone: {userSelect: 'none'},
        themeTextColor: {},
        textMicroBold: {},
        flexShrink1: {},
    })),
);

const ICON: Icon = {
    source: 'avatar.png',
    type: CONST.ICON_TYPE_AVATAR,
    name: 'Test user',
    id: 1,
};

describe('AvatarWithTextCell', () => {
    it('marks the text as copyable and excludes the avatar from copied content', () => {
        // Given a shared chat value rendered in a copyable search row.
        render(
            <AvatarWithTextCell
                reportName="Shared chat"
                icon={ICON}
                isLargeScreenWidth
                isCopyable
            />,
        );

        // When the copyable cell is rendered, then only its text participates in row copying.
        expect(screen.getByText('Shared chat')).toHaveProp('selectable', true);
        expect(screen.getByText('Shared chat')).toHaveProp('dataSet', expect.objectContaining({[CONST.COPYABLE_TEXT_ELEMENT]: true}));

        const avatar = screen.UNSAFE_getByType(AvatarFromIcon);
        expect(avatar.parent?.props).toMatchObject({
            style: {userSelect: 'none'},
            dataSet: {[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true},
        });
    });

    it('preserves the original non-copyable rendering for other callers', () => {
        // Given a shared chat value whose caller did not opt into text selection.
        render(
            <AvatarWithTextCell
                reportName="Shared chat"
                icon={ICON}
                isLargeScreenWidth
            />,
        );

        // When the default cell is rendered, then neither the text nor avatar receives copy-specific behavior.
        expect(screen.getByText('Shared chat')).not.toHaveProp('selectable', true);

        const avatar = screen.UNSAFE_getByType(AvatarFromIcon);
        expect(avatar.parent?.props).not.toMatchObject({dataSet: {[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}});
    });
});
