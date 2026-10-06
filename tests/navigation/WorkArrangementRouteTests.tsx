import {render} from '@testing-library/react-native';

import {SettingsModalStackNavigator} from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import {config} from '@libs/Navigation/linkingConfig/config';
import WORKSPACE_TO_RHP from '@libs/Navigation/linkingConfig/RELATIONS/WORKSPACE_TO_RHP';

import type {SettingsNavigatorParamList} from '@navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import React from 'react';

jest.mock('@hooks/useThemeStyles', () => () => ({modalStackNavigatorContainer: {}, modalStackNavigatorContainerWidth: () => ({})}));
jest.mock('@libs/Navigation/AppNavigator/ModalStackNavigators/useModalStackScreenOptions', () => () => () => ({}));
jest.mock('@pages/workspace/members/WorkArrangementPage', () => ({__esModule: true, default: () => null}));

describe('Work arrangement route', () => {
    function isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null;
    }

    function findScreenPath(screens: unknown): string | undefined {
        if (!isRecord(screens)) {
            return undefined;
        }

        for (const [screenName, configEntry] of Object.entries(screens)) {
            if (screenName === SCREENS.WORKSPACE.MEMBER_WORK_ARRANGEMENT && isRecord(configEntry) && typeof configEntry.path === 'string') {
                return configEntry.path;
            }
            if (isRecord(configEntry) && 'screens' in configEntry) {
                const path = findScreenPath(configEntry.screens);
                if (path) {
                    return path;
                }
            }
        }
    }

    function findInviteScreenPath(screens: unknown): string | undefined {
        if (!isRecord(screens)) {
            return undefined;
        }

        for (const [screenName, configEntry] of Object.entries(screens)) {
            if (screenName === SCREENS.WORKSPACE.INVITE_WORK_ARRANGEMENT && isRecord(configEntry) && typeof configEntry.path === 'string') {
                return configEntry.path;
            }
            if (isRecord(configEntry) && 'screens' in configEntry) {
                const path = findInviteScreenPath(configEntry.screens);
                if (path) {
                    return path;
                }
            }
        }
    }

    it('builds the member selector path from the policy and account IDs', () => {
        // Given a workspace policy and a member account
        const policyID = 'policy123';
        const accountID = 12345;

        // When the work arrangement route is generated
        const path = ROUTES.WORKSPACE_MEMBER_WORK_ARRANGEMENT.getRoute(policyID, accountID);

        // Then it includes both route parameters
        expect(ROUTES.WORKSPACE_MEMBER_WORK_ARRANGEMENT.route).toBe('workspaces/:policyID/members/:accountID/work-arrangement');
        expect(path).toBe(`workspaces/${policyID}/members/${accountID}/work-arrangement`);
    });

    it('registers the member selector as a workspace members RHP route', () => {
        // Given the workspace linking configuration
        // When the screen and RHP relationships are checked
        const arrangementPath = findScreenPath(config?.screens);

        // Then direct links resolve to the workspace member RHP
        expect(arrangementPath).toBe(ROUTES.WORKSPACE_MEMBER_WORK_ARRANGEMENT.route);
        expect(WORKSPACE_TO_RHP[SCREENS.WORKSPACE.MEMBERS]).toContain(SCREENS.WORKSPACE.MEMBER_WORK_ARRANGEMENT);
    });

    it('loads the selector from its workspace deep link in the settings modal stack', () => {
        // Given a deep link to a workspace member's work arrangement
        const path = ROUTES.WORKSPACE_MEMBER_WORK_ARRANGEMENT.getRoute('policy123', 12345);
        const modalState = getStateFromPath(path).routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)?.state;
        const settingsState = modalState?.routes.find((route) => route.name === SCREENS.RIGHT_MODAL.SETTINGS)?.state;
        expect(settingsState).toBeDefined();
        const navigation = createNavigationContainerRef<SettingsNavigatorParamList>();

        // When the URL state is rendered by the registered settings modal navigator
        render(
            <NavigationContainer
                ref={navigation}
                initialState={settingsState}
            >
                <SettingsModalStackNavigator />
            </NavigationContainer>,
        );

        // Then the lazy screen is loaded with the workspace and member route parameters
        expect(navigation.getCurrentRoute()).toEqual(
            expect.objectContaining({
                name: SCREENS.WORKSPACE.MEMBER_WORK_ARRANGEMENT,
                params: {policyID: 'policy123', accountID: '12345'},
            }),
        );
    });

    it('registers the invite arrangement editor under the invite confirmation route', () => {
        // Given the invite-specific work arrangement route
        const policyID = 'policy123';
        const path = ROUTES.WORKSPACE_INVITE_WORK_ARRANGEMENT.getRoute(policyID);
        const workflowInviteConfirmationPath = `workspaces/${policyID}/workflows/approvals/expenses-from/invite-message`;
        const workflowArrangementPath = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_INVITE_WORK_ARRANGEMENT.path, workflowInviteConfirmationPath);
        const workflowAdaptedState = getAdaptedStateFromPath(workflowArrangementPath, undefined);
        const cardInvitePath = ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER.getRoute({policyID, feed: 'cdf#bank', cardID: 'card123'});
        const cardArrangementPath = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_INVITE_WORK_ARRANGEMENT.path, cardInvitePath);

        // When the invite route is parsed
        const settingsState = getStateFromPath(path)
            .routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)
            ?.state?.routes.find((route) => route.name === SCREENS.RIGHT_MODAL.SETTINGS)?.state;
        const confirmationState = getStateFromPath(`workspaces/${policyID}/members/invite/invite-message`).routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)?.state;
        const confirmationSettingsState = confirmationState?.routes.find((route) => route.name === SCREENS.RIGHT_MODAL.SETTINGS)?.state;
        const workflowSettingsState = getStateFromPath(workflowArrangementPath)
            .routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)
            ?.state?.routes.find((route) => route.name === SCREENS.RIGHT_MODAL.SETTINGS)?.state;
        const cardSettingsState = getStateFromPath(cardArrangementPath)
            .routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)
            ?.state?.routes.find((route) => route.name === SCREENS.RIGHT_MODAL.SETTINGS)?.state;

        // Then it resolves to the invite editor and can return to the invite confirmation route
        expect(path).toBe(`workspaces/${policyID}/members/invite/invite-message/work-arrangement`);
        expect(ROUTES.WORKSPACE_INVITE_WORK_ARRANGEMENT.route).toBe('workspaces/:policyID/members/invite/invite-message/work-arrangement');
        expect(findInviteScreenPath(config?.screens)).toBe(DYNAMIC_ROUTES.WORKSPACE_INVITE_WORK_ARRANGEMENT.path);
        expect(workflowArrangementPath).toBe(`${workflowInviteConfirmationPath}/work-arrangement`);
        expect(WORKSPACE_TO_RHP[SCREENS.WORKSPACE.MEMBERS]).not.toContain(SCREENS.WORKSPACE.INVITE_WORK_ARRANGEMENT);
        expect(JSON.stringify(workflowAdaptedState)).toContain(SCREENS.WORKSPACE.DYNAMIC_WORKFLOWS_APPROVALS_EXPENSES_FROM);
        expect(settingsState?.routes.at(-1)).toEqual(
            expect.objectContaining({
                name: SCREENS.WORKSPACE.INVITE_WORK_ARRANGEMENT,
                params: expect.objectContaining({policyID}),
            }),
        );
        expect(confirmationSettingsState?.routes.at(-1)).toEqual(
            expect.objectContaining({
                name: SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE,
                params: {policyID},
            }),
        );
        expect(workflowSettingsState?.routes.at(-1)).toEqual(
            expect.objectContaining({
                name: SCREENS.WORKSPACE.INVITE_WORK_ARRANGEMENT,
                params: expect.objectContaining({policyID}),
            }),
        );
        expect(cardSettingsState?.routes.at(-1)).toEqual(
            expect.objectContaining({
                name: SCREENS.WORKSPACE.INVITE_WORK_ARRANGEMENT,
                params: expect.objectContaining({policyID, cardID: 'card123', feed: 'cdf#bank'}),
            }),
        );
    });
});
