import {render} from '@testing-library/react-native';
import React from 'react';
import Icon from '@components/Icon';
import {getAvatarLocal, getAvatarURL, PRESET_AVATAR_CATALOG} from '@libs/Avatars/PresetAvatarCatalog';

const SAMPLE_DEFAULT_ID = 'default-avatar_1';
const SAMPLE_SEASON_ID = 'car-blue100';

describe('PresetAvatarCatalog', () => {
    it('resolves a local component for a default avatar ID', () => {
        const AvatarComponent = getAvatarLocal(SAMPLE_DEFAULT_ID);
        expect(AvatarComponent).toBeDefined();
        expect(typeof AvatarComponent).toBe('function');
    });

    it('resolves a CDN URL for a default avatar ID', () => {
        const avatarUrl = getAvatarURL(SAMPLE_DEFAULT_ID);
        expect(avatarUrl).toContain(`/images/avatars/${SAMPLE_DEFAULT_ID}`);
    });

    it('renders a default avatar component', () => {
        const AvatarComponent = getAvatarLocal(SAMPLE_DEFAULT_ID);
        const {toJSON} = render(<Icon src={AvatarComponent} />);
        expect(toJSON()).toBeTruthy();
    });

    it('matches snapshot for a default avatar', () => {
        const AvatarComponent = getAvatarLocal(SAMPLE_DEFAULT_ID);
        const {toJSON} = render(<Icon src={AvatarComponent} />);
        expect(toJSON()).toMatchSnapshot();
    });

    it('resolves a local component for a seasonal avatar ID', () => {
        const AvatarComponent = getAvatarLocal(SAMPLE_SEASON_ID);
        expect(AvatarComponent).toBeDefined();
        expect(typeof AvatarComponent).toBe('function');
    });

    it('resolves a CDN URL for a seasonal avatar ID', () => {
        const avatarUrl = getAvatarURL(SAMPLE_SEASON_ID);
        expect(avatarUrl).toContain(`/images/avatars/custom-avatars/season-f1/${SAMPLE_SEASON_ID}`);
    });

    it('renders a seasonal avatar component', () => {
        const AvatarComponent = getAvatarLocal(SAMPLE_SEASON_ID);
        const {toJSON} = render(<Icon src={AvatarComponent} />);
        expect(toJSON()).toBeTruthy();
    });

    it('throws or returns undefined for an unknown ID', () => {
        // @ts-expect-error - This is a test for an unknown ID
        expect(getAvatarLocal('not-a-real-id')).toBeUndefined();
        // @ts-expect-error - This is a test for an unknown ID
        expect(getAvatarURL('not-a-real-id')).toBeUndefined();
    });

    it('ALL contains both default and seasonal IDs', () => {
        expect(Object.keys(PRESET_AVATAR_CATALOG)).toEqual(expect.arrayContaining([SAMPLE_DEFAULT_ID, SAMPLE_SEASON_ID]));
    });
});
