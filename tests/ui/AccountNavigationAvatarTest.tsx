import {cleanup, render, screen} from '@testing-library/react-native';

import AccountNavigationAvatar from '@components/Avatar/AccountNavigationAvatar';
import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';

import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const DELEGATE_EMAIL = 'delegate@example.com';
const EMOJI_STATUS = '🍔';

const DELEGATE_AVATAR_TEST_ID = 'delegate-avatar';
const STATUS_AVATAR_TEST_ID = 'status-avatar';
const PROFILE_AVATAR_TEST_ID = 'profile-avatar';

// The three avatar variants are replaced with markers so these tests assert which variant was picked,
// not how each one draws itself.
jest.mock('@pages/inbox/sidebar/AvatarWithDelegateAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns an untyped module; the typeof React annotation on the destructure enforces the expected shape
    const {createElement}: typeof React = require('react');
    return {__esModule: true, default: () => createElement('View', {testID: 'delegate-avatar'})};
});

jest.mock('@pages/inbox/sidebar/AvatarWithOptionalStatus', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns an untyped module; the typeof React annotation on the destructure enforces the expected shape
    const {createElement}: typeof React = require('react');
    return {__esModule: true, default: () => createElement('View', {testID: 'status-avatar'})};
});

jest.mock('@pages/inbox/sidebar/ProfileAvatarWithIndicator', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns an untyped module; the typeof React annotation on the destructure enforces the expected shape
    const {createElement}: typeof React = require('react');
    return {__esModule: true, default: () => createElement('View', {testID: 'profile-avatar'})};
});

const renderAvatar = async (emojiCode = '') => {
    render(
        <CurrentUserPersonalDetailsContext.Provider value={createMock<CurrentUserPersonalDetails>({status: {emojiCode}})}>
            <AccountNavigationAvatar />
        </CurrentUserPersonalDetailsContext.Provider>,
    );
    await waitForBatchedUpdatesWithAct();
};

describe('AccountNavigationAvatar', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        cleanup();
    });

    it('shows the plain profile avatar when there is no delegate and no emoji status', async () => {
        // Given an account that is neither delegated nor has an emoji status

        // When the avatar renders
        await renderAvatar();

        // Then the plain profile avatar is shown
        expect(screen.getByTestId(PROFILE_AVATAR_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(STATUS_AVATAR_TEST_ID)).not.toBeOnTheScreen();
        expect(screen.queryByTestId(DELEGATE_AVATAR_TEST_ID)).not.toBeOnTheScreen();
    });

    it('shows the status avatar when an emoji status is set', async () => {
        // Given an account with an emoji status and no delegate

        // When the avatar renders
        await renderAvatar(EMOJI_STATUS);

        // Then the avatar is badged with the emoji status
        expect(screen.getByTestId(STATUS_AVATAR_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(PROFILE_AVATAR_TEST_ID)).not.toBeOnTheScreen();
    });

    it('shows the delegate avatar when acting as a delegate, even with an emoji status set', async () => {
        // Given an account acting as a delegate that also has an emoji status
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: DELEGATE_EMAIL}});

        // When the avatar renders
        await renderAvatar(EMOJI_STATUS);

        // Then the delegate badge wins over the emoji status
        expect(screen.getByTestId(DELEGATE_AVATAR_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(STATUS_AVATAR_TEST_ID)).not.toBeOnTheScreen();
        expect(screen.queryByTestId(PROFILE_AVATAR_TEST_ID)).not.toBeOnTheScreen();
    });
});
