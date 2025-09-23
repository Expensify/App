import {findFocusedRoute} from '@react-navigation/native';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {Route} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import getStateFromPath from './getStateFromPath';

const FORWARD_TO_VERIFY_ACCOUNT_MAPPINGS = {
    default: ['search/view/:reportID/:reportActionID?', 'report/:reportID/:reportActionID?'],
};

function getForwardToFromPath(path: string): string {
    const pathWithoutParams = path.split('?').at(0);
    if (!pathWithoutParams) {
        return path.replace('/verify-account', '');
    }

    const pathWithoutVerifyAccount = pathWithoutParams.replace('/verify-account', '');

    const screenName = findFocusedRoute(getStateFromPath(pathWithoutVerifyAccount as Route) ?? {});

    if (!screenName?.name) {
        return pathWithoutVerifyAccount;
    }

    const routeConfig = normalizedConfigs[screenName.name as Screen];

    if (!routeConfig?.pattern || FORWARD_TO_VERIFY_ACCOUNT_MAPPINGS.default.includes(routeConfig.pattern)) {
        return pathWithoutVerifyAccount;
    }

    return pathWithoutVerifyAccount;
}

export default getForwardToFromPath;
