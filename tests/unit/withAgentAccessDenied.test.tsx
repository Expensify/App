import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import Text from '@components/Text';

import withAgentAccessDenied from '@libs/Navigation/AppNavigator/withAgentAccessDenied';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    isActiveRoute: jest.fn(() => false),
}));

jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));

function ProtectedContent() {
    return <Text testID="protected-content">Protected Content</Text>;
}

const getProtectedComponent = withAgentAccessDenied(() => ProtectedContent);

function renderComponent() {
    const Component = getProtectedComponent();
    return render(
        <ComposeProviders components={[LocaleContextProvider]}>
            <Component />
        </ComposeProviders>,
    );
}

describe('withAgentAccessDenied', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en' as const);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    beforeEach(() => {
        (Navigation.navigate as jest.Mock).mockClear();
        (Navigation.isActiveRoute as jest.Mock).mockReturnValue(false);
    });

    it('redirects agent account to the profile page instead of rendering the wrapped component', async () => {
        await TestHelper.signInWithTestUser(1, 'agent_123@expensify.ai');
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('protected-content')).toBeNull();
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_PROFILE.getRoute());
        });
    });

    it('shows access denied view instead of redirecting when agent is already on the redirect target', async () => {
        (Navigation.isActiveRoute as jest.Mock).mockReturnValue(true);
        await TestHelper.signInWithTestUser(1, 'agent_123@expensify.ai');
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('protected-content')).toBeNull();
            expect(screen.getByText('Not so fast...')).toBeDefined();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });

    it('renders wrapped component for non-agent account', async () => {
        await TestHelper.signInWithTestUser(1, 'user@expensify.com');
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeDefined();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });
});
