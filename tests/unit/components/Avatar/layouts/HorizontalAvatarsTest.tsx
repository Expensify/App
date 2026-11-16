import {render, screen} from '@testing-library/react-native';

import HorizontalAvatars from '@components/Avatar/layouts/HorizontalAvatars';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';

const ALICE: Icon = {id: 1, name: 'Alice', source: 'https://example.com/alice.png', type: CONST.ICON_TYPE_AVATAR};
const BOB: Icon = {id: 2, name: 'Bob', source: 'https://example.com/bob.png', type: CONST.ICON_TYPE_AVATAR};
const CAROL: Icon = {id: 3, name: 'Carol', source: 'https://example.com/carol.png', type: CONST.ICON_TYPE_AVATAR};

// Stand in for the avatar image, whose own rendering is covered elsewhere, so only the row layout is under test.
jest.mock('@components/Avatar/AvatarFromIcon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns an untyped module object
    const {View} = require('react-native');
    return ({testID, icon}: {testID: string; icon: Icon}) => (
        <View
            testID={testID}
            accessibilityLabel={icon.name}
        />
    );
});

describe('HorizontalAvatars', () => {
    it('should draw only `maxAvatarsPerRow` avatars and count the rest in a "+N" overlay', () => {
        // Given three participants in a row that has room for two
        // When the row renders
        render(
            <HorizontalAvatars
                icons={[ALICE, BOB, CAROL]}
                size={CONST.AVATAR_SIZE.DEFAULT}
                isInReportAction={false}
                maxAvatarsPerRow={2}
            />,
        );

        // Then the first two people keep their avatars and the third is counted in the overlay, so the row never grows past its limit
        const avatars = screen.getAllByTestId('Avatar-MultipleAvatars-StackedHorizontally-Avatar');
        expect(avatars).toHaveLength(2);
        expect(avatars.at(0)).toHaveAccessibleName(ALICE.name);
        expect(avatars.at(1)).toHaveAccessibleName(BOB.name);
        expect(screen.getByTestId('Avatar-MultipleAvatars-StackedHorizontally-LimitReached')).toBeOnTheScreen();
        expect(screen.getByText('+1')).toBeOnTheScreen();
    });

    it('should wrap the avatars onto a second row when `maxRows` allows it', () => {
        // Given three participants with two avatars per row and room for two rows
        // When the stack renders
        render(
            <HorizontalAvatars
                icons={[ALICE, BOB, CAROL]}
                size={CONST.AVATAR_SIZE.DEFAULT}
                isInReportAction={false}
                maxAvatarsPerRow={2}
                maxRows={2}
            />,
        );

        // Then the avatars split across two rows and all three people are drawn, because the overlay is only needed once every row is full
        expect(screen.getAllByTestId('Avatar-MultipleAvatars-StackedHorizontally-Row')).toHaveLength(2);
        expect(screen.getAllByTestId('Avatar-MultipleAvatars-StackedHorizontally-Avatar')).toHaveLength(3);
        expect(screen.queryByTestId('Avatar-MultipleAvatars-StackedHorizontally-LimitReached')).not.toBeOnTheScreen();
    });
});
