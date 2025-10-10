/* eslint-disable @typescript-eslint/no-unused-vars */
import {findFocusedRoute} from '@react-navigation/native';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {Route} from '@src/ROUTES';
import {VERIFY_ACCOUNT} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import getStateFromPath from './getStateFromPath';

/**
 * Mappings for routes that should be forwarded when completing verify account flow
 * Maps different scenarios to their expected route patterns
 * In the future this object will handle more components than just verify account
 */
const FORWARD_TO_VERIFY_ACCOUNT_MAPPINGS = {
    default: ['search/view/:reportID/:reportActionID?', 'report/:reportID/:reportActionID?'],
};

/**
 * Extracts the forward destination route from a verify account path.
 * Removes the verify-account segment and returns the underlying route that should be navigated to
 * after the verify account process is completed.
 * In the future, this functionality will be extended to other components beyond verify account.
 */
function getForwardToFromPath(path: string): Route {
    const pathWithoutParams = path.split('?').at(0);
    if (!pathWithoutParams) {
        throw new Error('Failed to parse the path, path is empty');
    }

    const pathWithoutVerifyAccount = pathWithoutParams.replace(`/${VERIFY_ACCOUNT}`, '');

    const screenName = findFocusedRoute(getStateFromPath(pathWithoutVerifyAccount as Route) ?? {});

    if (!screenName?.name) {
        throw new Error('Failed to parse the path, screen name is missing');
    }

    return pathWithoutVerifyAccount as Route;
}

export default getForwardToFromPath;
