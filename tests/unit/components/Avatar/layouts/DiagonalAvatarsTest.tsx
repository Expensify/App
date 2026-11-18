import {render, screen} from '@testing-library/react-native';

import DiagonalAvatars from '@components/Avatar/layouts/DiagonalAvatars';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ValueOf} from 'type-fest';

import React from 'react';

const ALICE: Icon = {id: 1, name: 'Alice', source: 'https://example.com/alice.png', type: CONST.ICON_TYPE_AVATAR};
const BOB: Icon = {id: 2, name: 'Bob', source: 'https://example.com/bob.png', type: CONST.ICON_TYPE_AVATAR};
const CAROL: Icon = {id: 3, name: 'Carol', source: 'https://example.com/carol.png', type: CONST.ICON_TYPE_AVATAR};

// The size each avatar is drawn at, keyed by its testID, so a test can check how the stack scales its avatars.
let mockAvatarSizes: Record<string, ValueOf<typeof CONST.AVATAR_SIZE>> = {};

// Stand in for the avatar image, whose own rendering is covered elsewhere, so only the stack layout is under test.
jest.mock('@components/Avatar/AvatarFromIcon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns an untyped module object
    const {View} = require('react-native');
    return ({testID, size}: {testID: string; size: ValueOf<typeof CONST.AVATAR_SIZE>}) => {
        mockAvatarSizes[testID] = size;
        return <View testID={testID} />;
    };
});

describe('DiagonalAvatars', () => {
    beforeEach(() => {
        mockAvatarSizes = {};
    });

    it('should collapse every avatar past the first into a "+N" overlay when there are three or more', () => {
        // Given three participants, which is more than the two slots a diagonal stack can draw
        // When the stack renders
        render(
            <DiagonalAvatars
                icons={[ALICE, BOB, CAROL]}
                size={CONST.AVATAR_SIZE.DEFAULT}
                isInReportAction={false}
            />,
        );

        // Then only the primary avatar is drawn and the second slot counts the others, so the stack keeps its footprint however many people there are
        expect(screen.getByTestId('Avatar-MultipleAvatars-MainAvatar')).toBeOnTheScreen();
        expect(screen.getByTestId('Avatar-MultipleAvatars-LimitReached')).toBeOnTheScreen();
        expect(screen.getByText('+2')).toBeOnTheScreen();
        expect(screen.queryByTestId('Avatar-MultipleAvatars-SecondaryAvatar')).not.toBeOnTheScreen();
    });

    it('should draw the second avatar instead of a "+N" overlay when there are exactly two', () => {
        // Given two participants, which fit the two slots of a diagonal stack
        // When the stack renders
        render(
            <DiagonalAvatars
                icons={[ALICE, BOB]}
                size={CONST.AVATAR_SIZE.DEFAULT}
                isInReportAction={false}
            />,
        );

        // Then both people are shown by their own avatar, because a "+1" would hide a face that has room to be drawn
        expect(screen.getByTestId('Avatar-MultipleAvatars-MainAvatar')).toBeOnTheScreen();
        expect(screen.getByTestId('Avatar-MultipleAvatars-SecondaryAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('Avatar-MultipleAvatars-LimitReached')).not.toBeOnTheScreen();
    });

    it('should shrink both avatars when the stack renders at small size', () => {
        // Given two participants shown in a small slot, such as a compact list row
        // When the stack renders at small size
        render(
            <DiagonalAvatars
                icons={[ALICE, BOB]}
                size={CONST.AVATAR_SIZE.SMALL}
                isInReportAction={false}
            />,
        );

        // Then both avatars are still drawn, each at the smallest size, so the overlapping pair fits inside the small slot
        expect(screen.getByTestId('Avatar-MultipleAvatars-MainAvatar')).toBeOnTheScreen();
        expect(screen.getByTestId('Avatar-MultipleAvatars-SecondaryAvatar')).toBeOnTheScreen();
        expect(mockAvatarSizes['Avatar-MultipleAvatars-MainAvatar']).toBe(CONST.AVATAR_SIZE.XXX_SMALL);
        expect(mockAvatarSizes['Avatar-MultipleAvatars-SecondaryAvatar']).toBe(CONST.AVATAR_SIZE.XXX_SMALL);
    });
});
