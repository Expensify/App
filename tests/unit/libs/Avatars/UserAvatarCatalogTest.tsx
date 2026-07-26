import {render} from '@testing-library/react-native';

import Icon from '@components/Icon';

import {USER_AVATARS} from '@libs/Avatars/UserAvatarCatalog';

import React from 'react';

const SAMPLE_DEFAULT_ID = 'default-avatar_1';
const SAMPLE_SEASON_ID = 'car-blue100';

describe('UserAvatarCatalog', () => {
    it('resolves a local component for a default avatar ID', () => {
        const AvatarComponent = USER_AVATARS.getLocal(SAMPLE_DEFAULT_ID);
        expect(AvatarComponent).toBeDefined();
        expect(typeof AvatarComponent).toBe('function');
    });

    it('resolves a CDN URL for a default avatar ID', () => {
        const avatarUrl = USER_AVATARS.getURL(SAMPLE_DEFAULT_ID);
        expect(avatarUrl).toContain(`/images/avatars/${SAMPLE_DEFAULT_ID}`);
    });

    it('renders a default avatar component', () => {
        const AvatarComponent = USER_AVATARS.getLocal(SAMPLE_DEFAULT_ID);
        const {toJSON} = render(<Icon src={AvatarComponent} />);
        expect(toJSON()).toBeTruthy();
    });

    it('matches snapshot for a default avatar', () => {
        const AvatarComponent = USER_AVATARS.getLocal(SAMPLE_DEFAULT_ID);
        const {toJSON} = render(<Icon src={AvatarComponent} />);
        expect(toJSON()).toMatchSnapshot();
    });

    it('resolves a local component for a seasonal avatar ID', () => {
        const AvatarComponent = USER_AVATARS.getLocal(SAMPLE_SEASON_ID);
        expect(AvatarComponent).toBeDefined();
        expect(typeof AvatarComponent).toBe('function');
    });

    it('resolves a CDN URL for a seasonal avatar ID', () => {
        const avatarUrl = USER_AVATARS.getURL(SAMPLE_SEASON_ID);
        expect(avatarUrl).toContain(`/images/avatars/custom-avatars/season-f1/${SAMPLE_SEASON_ID}`);
    });

    it('renders a seasonal avatar component', () => {
        const AvatarComponent = USER_AVATARS.getLocal(SAMPLE_SEASON_ID);
        const {toJSON} = render(<Icon src={AvatarComponent} />);
        expect(toJSON()).toBeTruthy();
    });

    it('returns undefined for an unknown ID', () => {
        expect(USER_AVATARS.getLocal('not-a-real-id')).toBeUndefined();
        expect(USER_AVATARS.getURL('not-a-real-id')).toBeUndefined();
    });

    it('contains both default and seasonal IDs', () => {
        expect(Object.keys(USER_AVATARS.entries)).toEqual(expect.arrayContaining([SAMPLE_DEFAULT_ID, SAMPLE_SEASON_ID]));
    });

    it('does not contain bot avatar IDs', () => {
        expect(Object.keys(USER_AVATARS.entries)).not.toContain('bot-avatar--blue');
    });
});
