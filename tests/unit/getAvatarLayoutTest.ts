import getAvatarLayout from '@components/Avatar/layouts/getAvatarLayout';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

const primaryIcon: Icon = {id: 1, name: 'Primary', source: 'https://avatar/1', type: CONST.ICON_TYPE_AVATAR};
const secondaryIcon: Icon = {id: 2, name: 'Secondary', source: 'https://avatar/2', type: CONST.ICON_TYPE_WORKSPACE};
const namelessSecondaryIcon: Icon = {id: 2, name: '', source: 'https://avatar/2', type: CONST.ICON_TYPE_WORKSPACE};

describe('getAvatarLayout', () => {
    describe('icon resolution', () => {
        it('returns primaryIcon and secondaryIcon from the icons array', () => {
            expect(getAvatarLayout({icons: [primaryIcon, secondaryIcon]})).toEqual({
                layout: CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
                primaryIcon,
                secondaryIcon,
            });
        });

        it('returns undefined secondaryIcon when only one icon is provided', () => {
            expect(getAvatarLayout({icons: [primaryIcon]})).toEqual({
                layout: CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
                primaryIcon,
                secondaryIcon: undefined,
            });
        });
    });

    describe('MULTIPLE resolution', () => {
        it.each([
            {shouldStackHorizontally: true, expected: CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL},
            {shouldStackHorizontally: false, expected: CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL},
        ])('resolves MULTIPLE to $expected when shouldStackHorizontally is $shouldStackHorizontally', ({shouldStackHorizontally, expected}) => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, secondaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE,
                    shouldStackHorizontally,
                }).layout,
            ).toBe(expected);
        });
    });

    describe('SUBSCRIPT', () => {
        it('returns SUBSCRIPT when the secondary icon has a name', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, secondaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
        });

        it('returns SUBSCRIPT_CARD_FEED when hasCardFeed is true even if the secondary icon has no name', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, namelessSecondaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT,
                    hasCardFeed: true,
                    shouldRequireSecondaryIconName: true,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT_CARD_FEED);
        });

        it('returns SUBSCRIPT_CARD_FEED over SUBSCRIPT when hasCardFeed is true and the secondary icon has a name', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, secondaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT,
                    hasCardFeed: true,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT_CARD_FEED);
        });

        it('returns SUBSCRIPT when the secondary icon has no name and a name is not required', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, namelessSecondaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
        });

        it('falls back to SINGLE when the secondary icon is missing', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
        });

        it('falls back to SINGLE when a name is required, the secondary icon has no name and there is no card feed', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, namelessSecondaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT,
                    shouldRequireSecondaryIconName: true,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
        });
    });

    describe('MULTIPLE_DIAGONAL', () => {
        it('returns MULTIPLE_DIAGONAL when the secondary icon has a name', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, secondaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
        });

        it('falls back to SINGLE when the secondary icon is missing', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
        });

        it('returns MULTIPLE_DIAGONAL when the secondary icon has no name and a name is not required', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, namelessSecondaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
        });

        it('falls back to SINGLE when a name is required and the secondary icon has no name', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, namelessSecondaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL,
                    shouldRequireSecondaryIconName: true,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
        });
    });

    describe('MULTIPLE_HORIZONTAL', () => {
        it('passes through even when the secondary icon is missing', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL);
        });
    });

    describe('SINGLE and omitted avatarType', () => {
        it('returns SINGLE when avatarType is SINGLE even if a secondary icon is provided', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, secondaryIcon],
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
        });

        it('returns SINGLE when avatarType is omitted, even with two icons', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon, secondaryIcon],
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
        });

        it('returns SINGLE when avatarType is omitted and only one icon is provided', () => {
            expect(
                getAvatarLayout({
                    icons: [primaryIcon],
                }).layout,
            ).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
        });
    });
});
