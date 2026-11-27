import {render} from '@testing-library/react-native';

import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import NavigationRoot from '@libs/Navigation/NavigationRoot';
import type {State} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// The `mock` prefix lets the hoisted jest.mock factory capture the initial state NavigationRoot computes.
let mockCapturedInitialState: State | undefined;

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        NavigationContainer: ({initialState}: {initialState?: State}) => {
            mockCapturedInitialState = initialState;
            return null;
        },
    };
});
jest.mock('@libs/Navigation/AppNavigator', () => () => null);
jest.mock('@libs/NavigationFocusReturn', () => ({setupNavigationFocusReturn: jest.fn(), teardownNavigationFocusReturn: jest.fn()}));
jest.mock('@src/libs/telemetry/useStartSpansOnRender', () => jest.fn());
jest.mock('@hooks/useTheme', () => () => ({appBG: '#000000', colorScheme: 'dark'}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: true}));

const DISTANCE_EDIT_ROUTE = ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.SUBMIT, '1', '2');

describe('NavigationRoot initial state', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockCapturedInitialState = undefined;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('restores the last visited path on a cold start for a public domain account', async () => {
        // Given a signed-in user with a public domain email (e.g. gmail.com) who had the distance editor open
        await Onyx.set(ONYXKEYS.ACCOUNT, {isFromPublicDomain: true});
        await waitForBatchedUpdates();

        // When the native app cold starts without a deep link, so there is no initial URL
        render(
            <NavigationRoot
                authenticated
                lastVisitedPath={DISTANCE_EDIT_ROUTE as Route}
                initialUrl={null}
                onReady={() => {}}
            />,
        );

        // Then the saved page is restored, because the email domain must not change which screen the user returns to
        if (!mockCapturedInitialState) {
            throw new Error('NavigationRoot did not restore an initial state');
        }
        expect(getPathFromState(mockCapturedInitialState)).toBe(getPathFromState(getAdaptedStateFromPath(DISTANCE_EDIT_ROUTE as Route)));
    });

    it('does not restore the last visited path when the user is signed out', async () => {
        // Given a public domain account whose session is no longer authenticated
        await Onyx.set(ONYXKEYS.ACCOUNT, {isFromPublicDomain: true});
        await waitForBatchedUpdates();

        // When the native app cold starts without a deep link
        render(
            <NavigationRoot
                authenticated={false}
                lastVisitedPath={DISTANCE_EDIT_ROUTE as Route}
                initialUrl={null}
                onReady={() => {}}
            />,
        );

        // Then React Navigation picks the initial state, so a signed-out user can't land on a protected page
        expect(mockCapturedInitialState).toBeUndefined();
    });

    it('sends a copilot who opens an onboarding link to Home', async () => {
        // Given a copilot acting for an account that has not finished onboarding
        await Onyx.set(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'copilot@test.com'}});
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        // When the app starts from an onboarding link
        render(
            <NavigationRoot
                authenticated
                lastVisitedPath={ROUTES.HOME}
                initialUrl={`${CONST.NEW_EXPENSIFY_URL}${ROUTES.ONBOARDING_PURPOSE.route}`}
                onReady={() => {}}
            />,
        );

        // Then the app opens Home, because the initial state never passes through OnboardingGuard
        if (!mockCapturedInitialState) {
            throw new Error('NavigationRoot did not set an initial state');
        }
        expect(getPathFromState(mockCapturedInitialState)).toBe(getPathFromState(getAdaptedStateFromPath(ROUTES.HOME)));
    });

    it('does not restore an onboarding page on a cold start', async () => {
        // Given a user whose cached onboarding NVP says incomplete, which may predate a completion made on another device
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        // When the native app cold starts without a deep link after being closed on an onboarding page
        render(
            <NavigationRoot
                authenticated
                lastVisitedPath={ROUTES.ONBOARDING_WORK_EMAIL.route as Route}
                initialUrl={null}
                onReady={() => {}}
            />,
        );

        // Then React Navigation picks the initial state, leaving useOnboardingFlowRouter to reopen onboarding once fresh app data confirms it
        expect(mockCapturedInitialState).toBeUndefined();
    });

    it('opens Home instead of an onboarding URL when a signed-in user reloads', async () => {
        // Given a user whose cached onboarding NVP says incomplete, which may predate a completion made on another device
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        // When the web app reloads on an onboarding URL
        render(
            <NavigationRoot
                authenticated
                lastVisitedPath={ROUTES.HOME}
                initialUrl={`${CONST.NEW_EXPENSIFY_URL}${ROUTES.ONBOARDING_WORK_EMAIL.route}`}
                onReady={() => {}}
            />,
        );

        // Then Home opens, leaving useOnboardingFlowRouter to reopen onboarding once fresh app data confirms it
        if (!mockCapturedInitialState) {
            throw new Error('NavigationRoot did not set an initial state');
        }
        expect(getPathFromState(mockCapturedInitialState)).toBe(getPathFromState(getAdaptedStateFromPath(ROUTES.HOME)));
    });

    it('restores a join-workspace task page on a cold start', async () => {
        // Given a completed user who was on the join-workspace task screen, which the onboarding router never reopens
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await waitForBatchedUpdates();
        const joinWorkspaceTaskPath = `${ROUTES.ONBOARDING_WORKSPACES.route}?isJoinWorkspaceTask=true` as Route;

        // When the native app cold starts without a deep link
        render(
            <NavigationRoot
                authenticated
                lastVisitedPath={joinWorkspaceTaskPath}
                initialUrl={null}
                onReady={() => {}}
            />,
        );

        // Then the task page is restored, because nothing else would bring the user back to it
        if (!mockCapturedInitialState) {
            throw new Error('NavigationRoot did not restore an initial state');
        }
        expect(getPathFromState(mockCapturedInitialState)).toBe(getPathFromState(getAdaptedStateFromPath(joinWorkspaceTaskPath)));
    });
});
