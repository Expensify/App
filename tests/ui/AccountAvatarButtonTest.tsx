import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import AccountAvatarButton from '@components/Navigation/AccountAvatarButton';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import Tooltip from '@components/Tooltip';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigation from '@react-navigation/native';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: true})));
jest.mock('@hooks/useAccountTabIndicatorStatus', () => () => ({status: undefined}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@components/Avatar/AccountNavigationAvatar', () => () => null);
jest.mock('@components/ProductTrainingContext', () => ({useProductTrainingContext: jest.fn()}));
jest.mock('@components/Tooltip', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/interceptAnonymousUser', () => (callback: () => void) => callback());
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
    useRoute: jest.fn(() => ({name: 'Home'})),
}));

describe('AccountAvatarButton', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    afterEach(async () => {
        cleanup();
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([false, true])('keeps Account navigation without educational training (legacy dismissal: %s)', async (hasLegacyDismissal) => {
        // Given either a fresh account or one with a historical Account tooltip dismissal
        if (hasLegacyDismissal) {
            await Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                accountMovedToTopBar: {timestamp: '2026-01-01 00:00:00', dismissedMethod: 'x'},
            });
        }

        // When the narrow-layout Account button renders and is pressed
        render(<AccountAvatarButton />);
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        // Then the ordinary hover tooltip and navigation remain, without registering educational training
        expect(Tooltip).toHaveBeenCalledWith(expect.objectContaining({text: 'initialSettingsPage.account', isFocused: true}), undefined);
        expect(useProductTrainingContext).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS);
    });

    it('does not navigate again when Account is already selected', async () => {
        // Given the Account screen is already selected
        jest.mocked(useRoute).mockReturnValueOnce({key: 'settings', name: SCREENS.SETTINGS.ROOT});

        // When its avatar is pressed
        render(<AccountAvatarButton />);
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        // Then no duplicate navigation is requested
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does not render an extra Account button in wide layout', () => {
        // Given the wide layout already has an Account tab
        jest.mocked(useResponsiveLayout).mockReturnValueOnce({...useResponsiveLayout(), shouldUseNarrowLayout: false});

        // When the top-bar avatar renders
        render(<AccountAvatarButton />);

        // Then there is no duplicate Account control
        expect(screen.queryByRole(CONST.ROLE.BUTTON)).toBeNull();
    });
});
