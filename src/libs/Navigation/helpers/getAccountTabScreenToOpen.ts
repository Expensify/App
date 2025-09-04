import type {NavigatorScreenParams} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import type CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import {getSettingsTabStateFromSessionStorage} from './lastVisitedTabPathUtils';

/**
 * Returns the Settings screen that should be opened on the Account tab.
 */
export default function getAccountTabScreenToOpen(subscriptionPlan: ValueOf<typeof CONST.POLICY.TYPE> | null): NavigatorScreenParams<SettingsSplitNavigatorParamList> {
    if (getIsNarrowLayout()) {
        return {screen: SCREENS.SETTINGS.ROOT};
    }

    const settingsTabState = getSettingsTabStateFromSessionStorage();
    if (!settingsTabState) {
        return {screen: SCREENS.SETTINGS.PROFILE.ROOT, params: {}};
    }

    const screen = findFocusedRoute(settingsTabState)?.name as keyof SettingsSplitNavigatorParamList | undefined;
    if ((!subscriptionPlan && screen === SCREENS.SETTINGS.SUBSCRIPTION.ROOT) || !screen) {
        return {screen: SCREENS.SETTINGS.PROFILE.ROOT, params: {}};
    }

    return {screen};
}
