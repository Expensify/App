import {findFocusedRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFullScreenName} from '@navigation/helpers/isNavigatorName';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import type {RootNavigatorParamList, State} from '@navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {getActiveTransactionReportIDs} from './TransactionReportIDRepository';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentReportID: string;
};

/**
 * We only want to show the extra navigation for switching between transactions
 * If a transaction was opened from MoneyRequestReportView
 */
function shouldShowTransactionNavigation(rootState?: State<RootNavigatorParamList>) {
    const lastFullscreenNavigator = rootState?.routes.findLast((route) => isFullScreenName(route.name));
    if (lastFullscreenNavigator?.state) {
        const focusedRoute = findFocusedRoute(lastFullscreenNavigator.state);
        return focusedRoute?.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT;
    }
}

function MoneyRequestReportTransactionsNavigation({currentReportID}: MoneyRequestReportRHPNavigationButtonsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;
    const shouldShow = shouldShowTransactionNavigation(rootState);

    const reportIDsList = getActiveTransactionReportIDs();
    const {prevReportID, nextReportID} = useMemo(() => {
        if (!reportIDsList) {
            return {prevReportID: undefined, nextReportID: undefined};
        }

        const currentReportIndex = reportIDsList.findIndex((id) => id === currentReportID);

        const prevID = currentReportIndex > 0 ? reportIDsList.at(currentReportIndex - 1) : undefined;
        const nextID = currentReportIndex <= reportIDsList.length - 1 ? reportIDsList.at(currentReportIndex + 1) : undefined;

        return {prevReportID: prevID, nextReportID: nextID};
    }, [currentReportID, reportIDsList]);

    const backTo = Navigation.getActiveRoute();

    if (!shouldShow || reportIDsList.length < 2) {
        return;
    }

    const pressableStyle = [
        styles.ml1,
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        {
            borderRadius: 50,
            width: 28,
            height: 28,
            backgroundColor: theme.borderLighter,
        },
    ];

    return (
        <>
            <PressableWithFeedback
                accessibilityRole={CONST.ROLE.BUTTON}
                accessible
                accessibilityLabel={CONST.ROLE.BUTTON}
                disabled={!prevReportID}
                style={pressableStyle}
                onPress={(e) => {
                    e?.preventDefault();
                    Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: prevReportID, backTo}), {forceReplace: true});
                }}
            >
                <Icon
                    src={Expensicons.BackArrow}
                    small
                    fill={theme.icon}
                    isButtonIcon
                />
            </PressableWithFeedback>
            <PressableWithFeedback
                accessibilityRole={CONST.ROLE.BUTTON}
                accessible
                accessibilityLabel={CONST.ROLE.BUTTON}
                disabled={!nextReportID}
                style={pressableStyle}
                onPress={(e) => {
                    e?.preventDefault();
                    Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: nextReportID, backTo}), {forceReplace: true});
                }}
            >
                <Icon
                    src={Expensicons.ArrowRight}
                    small
                    fill={theme.icon}
                    isButtonIcon
                />
            </PressableWithFeedback>
        </>
    );
}

MoneyRequestReportTransactionsNavigation.displayName = 'MoneyRequestReportTransactionsNavigation';

export default MoneyRequestReportTransactionsNavigation;
