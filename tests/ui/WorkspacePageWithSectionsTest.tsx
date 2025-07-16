import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type Navigation from '@libs/Navigation/Navigation';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 1;

// Mock navigation hooks
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
        useRoute: () => ({
            key: 'test-route',
            name: 'WORKSPACE_INITIAL',
            params: {policyID: POLICY_ID.toString()},
        }),
        usePreventRemove: jest.fn(),
    };
});

// Mock useResponsiveLayout hook
jest.mock('@src/hooks/useResponsiveLayout');

// Mock FullScreenLoadingIndicator
jest.mock('@components/FullscreenLoadingIndicator', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ReactNative = require('react-native');
    return () => {
        return <ReactNative.View testID="FullScreenLoadingIndicator" />;
    };
});

const mockPolicy: Policy = {...createRandomPolicy(POLICY_ID), type: CONST.POLICY.TYPE.CORPORATE, pendingAction: null, role: CONST.POLICY.ROLE.ADMIN};

const renderWorkspacePageWithSections = (props = {}) => {
    const defaultProps = {
        headerText: 'Test Workspace',
        route: {
            key: 'test-route',
            name: SCREENS.WORKSPACE.INITIAL,
            params: {policyID: POLICY_ID.toString()},
        },
        policy: mockPolicy,
        ...props,
    };

    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspacePageWithSections
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultProps}
            >
                <View />
            </WorkspacePageWithSections>
        </ComposeProviders>,
    );
};

describe('WorkspacePageWithSections', () => {
    describe('FullScreenLoadingIndicator behavior', () => {
        beforeAll(() => {
            Onyx.init({
                keys: ONYXKEYS,
            });
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
            return waitForBatchedUpdates();
        });

        afterEach(() => {
            jest.clearAllMocks();
            return Onyx.clear();
        });

        it('should not display FullScreenLoadingIndicator when user is offline', async () => {
            // Given the network state is offline
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});

            // When render the component with loading enabled
            renderWorkspacePageWithSections({
                shouldShowLoading: true,
                isLoading: true,
            });

            await waitForBatchedUpdatesWithAct();

            // Then the FullScreenLoadingIndicator should not be displayed
            expect(screen.queryByTestId('FullScreenLoadingIndicator')).toBeNull();
        });

        it('should display FullScreenLoadingIndicator when user is online and loading', async () => {
            // Given the network state is online
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});

            // When render the component with loading enabled
            renderWorkspacePageWithSections({
                shouldShowLoading: true,
                isLoading: true,
            });

            await waitForBatchedUpdatesWithAct();

            // Then the FullScreenLoadingIndicator should be displayed
            expect(screen.getByTestId('FullScreenLoadingIndicator')).toBeTruthy();
        });
    });
});
