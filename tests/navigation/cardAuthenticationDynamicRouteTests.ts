import {getActionFromState} from '@react-navigation/core';
import {findFocusedRoute} from '@react-navigation/native';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

/**
 * The 3DS card-authentication screen is a dynamic route layered on the current base path. It never receives an
 * explicit `policyID` at navigation time; instead `getStateFromPath` merges the base route's params onto the dynamic
 * leaf. These tests pin that behavior so the owner-change flow keeps its `policyID` (and subscription keeps none),
 * which is what routes `DynamicCardAuthenticationPage.onSuccess` to the correct verify action.
 */

const POLICY_ID = 'ABC123';
const ACCOUNT_ID = 456;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

/** Read `policyID` off loosely-typed route/action params without asserting a shape onto them. */
function getPolicyID(params: unknown): unknown {
    return isRecord(params) ? params.policyID : undefined;
}

/**
 * React Navigation encodes nested navigators as `payload.params.screen` / `payload.params.params`. Walk that chain
 * to the deepest target so we can assert the screen name + params that actually land on the focused screen.
 */
function findDeepestPayload(action: unknown): {name: unknown; params: unknown} {
    if (!isRecord(action) || !isRecord(action.payload)) {
        return {name: undefined, params: undefined};
    }
    let name: unknown = action.payload.name;
    let params: unknown = action.payload.params;
    while (isRecord(params) && ('screen' in params || 'params' in params)) {
        name = params.screen;
        params = params.params;
    }
    return {name, params};
}

// `createDynamicRoute` is exactly how production builds these paths: it appends the dynamic suffix to the current
// base route and returns a real `Route`, so no `as Route` cast is needed here.
const ownerChangePath = createDynamicRoute(
    DYNAMIC_ROUTES.CARD_AUTHENTICATION.path,
    ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(POLICY_ID, ACCOUNT_ID, CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD),
);
const subscriptionPath = createDynamicRoute(DYNAMIC_ROUTES.CARD_AUTHENTICATION.path, ROUTES.SETTINGS_SUBSCRIPTION.getRoute());

describe('card-authentication dynamic route policyID inheritance', () => {
    it('inherits policyID from the owner-change base path onto the dynamic auth screen (parse layer)', () => {
        const focused = findFocusedRoute(getStateFromPath(ownerChangePath));

        expect(focused?.name).toBe(SCREENS.DYNAMIC_CARD_AUTHENTICATION);
        expect(getPolicyID(focused?.params)).toBe(POLICY_ID);
    });

    it('carries policyID into the dispatched navigation action for the owner-change flow', () => {
        const action = getActionFromState(getStateFromPath(ownerChangePath), linkingConfig.config);
        const target = findDeepestPayload(action);

        expect(target.name).toBe(SCREENS.DYNAMIC_CARD_AUTHENTICATION);
        expect(getPolicyID(target.params)).toBe(POLICY_ID);
    });

    it('does not attach a policyID for the subscription flow', () => {
        const focused = findFocusedRoute(getStateFromPath(subscriptionPath));

        expect(focused?.name).toBe(SCREENS.DYNAMIC_CARD_AUTHENTICATION);
        expect(getPolicyID(focused?.params)).toBeUndefined();
    });
});
