import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type Navigation from '@libs/Navigation/Navigation';
import {setHasRadio} from '@libs/NetworkState';

import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
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

// Keep the Workspaces tab reported as focused so the not-found view isn't suppressed by the tab-focus guard.
jest.mock('@hooks/useIsWorkspacesTabFocused', () => () => true);

// Mock FullScreenLoadingIndicator
jest.mock('@components/FullscreenLoadingIndicator', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ReactNative = require('react-native');
    return () => {
        return <ReactNative.View testID="FullScreenLoadingIndicator" />;
    };
});

const mockPolicy: Policy = {...createRandomPolicy(POLICY_ID), type: CONST.POLICY.TYPE.CORPORATE, pendingAction: null, role: CONST.POLICY.ROLE.ADMIN};

const getDefaultProps = (props = {}) => ({
    headerText: 'Test Workspace',
    route: {
        key: 'test-route',
        name: SCREENS.WORKSPACE.INITIAL,
        params: {policyID: POLICY_ID.toString()},
    },
    policy: mockPolicy,
    ...props,
});

const renderWithProps = (props: ReturnType<typeof getDefaultProps>) => (
    <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
        <WorkspacePageWithSections {...props}>
            <View />
        </WorkspacePageWithSections>
    </ComposeProviders>
);

const renderWorkspacePageWithSections = (props = {}) => render(renderWithProps(getDefaultProps(props)));

describe('WorkspacePageWithSections', () => {
    describe('FullScreenLoadingIndicator behavior', () => {
        beforeAll(async () => {
            Onyx.init({
                keys: ONYXKEYS,
            });
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await waitForBatchedUpdatesWithAct();
            });
        });

        afterEach(async () => {
            jest.clearAllMocks();
            await act(async () => {
                await Onyx.clear();
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('should not display FullScreenLoadingIndicator when user is offline', async () => {
            // Given the network state is offline
            setHasRadio(false);

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
            setHasRadio(true);

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

    describe('FullPageNotFoundView behavior when deleting a workspace', () => {
        // The policy is read from Onyx via the withPolicy HOC (which overrides the `policy` prop), so these
        // tests drive the workspace state through the Onyx policy collection to mirror the real delete flow.
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}` as const;

        beforeEach(async () => {
            // Render the page content (not the loading indicator) so we can assert on the not-found view directly.
            setHasRadio(false);
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.HAS_LOADED_APP]: true,
                    [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                });
                await waitForBatchedUpdatesWithAct();
            });
        });

        afterEach(async () => {
            jest.clearAllMocks();
            await act(async () => {
                await Onyx.clear();
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('should not flash the not-found page when the viewed workspace is deleted (pending delete -> removed from Onyx)', async () => {
            // Given the workspace we're viewing is optimistically marked as pending delete
            await act(async () => {
                await Onyx.set(policyKey, {...mockPolicy, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
                await waitForBatchedUpdatesWithAct();
            });
            renderWorkspacePageWithSections();
            await waitForBatchedUpdatesWithAct();

            // Then the not-found page should not be shown during the pending-delete state
            expect(screen.queryByTestId('FullPageNotFoundView')).toBeNull();

            // When the backend confirms the deletion and the policy is removed from Onyx entirely
            await act(async () => {
                await Onyx.set(policyKey, null);
                await waitForBatchedUpdatesWithAct();
            });

            // Then the not-found page should still not be shown
            expect(screen.queryByTestId('FullPageNotFoundView')).toBeNull();

            // When the still-mounted screen re-renders again during the navigation/exit animation (prevPolicy is now empty)
            await act(async () => {
                await Onyx.merge(ONYXKEYS.ACCOUNT, {isUsingExpensifyCard: true});
                await waitForBatchedUpdatesWithAct();
            });

            // Then the not-found page should remain suppressed by the latch
            expect(screen.queryByTestId('FullPageNotFoundView')).toBeNull();
        });

        it('should still show the not-found page for a genuinely empty/inaccessible workspace with no preceding pending-delete state', async () => {
            // Given a workspace that is empty from the start, without ever being pending delete
            renderWorkspacePageWithSections();
            await waitForBatchedUpdatesWithAct();

            // Then the not-found page should be shown
            expect(screen.getByTestId('FullPageNotFoundView')).toBeTruthy();
        });

        it('should show the not-found page again when the same screen instance is reused for a different, inaccessible workspace after a delete', async () => {
            const OTHER_POLICY_ID = 2;

            // Given the currently viewed workspace is deleted (pending delete -> removed from Onyx) and the latch is set
            await act(async () => {
                await Onyx.set(policyKey, {...mockPolicy, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
                await waitForBatchedUpdatesWithAct();
            });
            const {rerender} = renderWorkspacePageWithSections();
            await waitForBatchedUpdatesWithAct();
            await act(async () => {
                await Onyx.set(policyKey, null);
                await waitForBatchedUpdatesWithAct();
            });
            expect(screen.queryByTestId('FullPageNotFoundView')).toBeNull();

            // When the still-mounted screen is reused for a different workspace that the user cannot access (absent from Onyx)
            rerender(
                renderWithProps(
                    getDefaultProps({
                        route: {key: 'test-route', name: SCREENS.WORKSPACE.INITIAL, params: {policyID: OTHER_POLICY_ID.toString()}},
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            // Then the stale delete latch (keyed by the previous policyID) must not suppress the not-found page for the new workspace
            expect(screen.getByTestId('FullPageNotFoundView')).toBeTruthy();
        });
    });
});
