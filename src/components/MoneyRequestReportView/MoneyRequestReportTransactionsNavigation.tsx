import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearActiveTransactionThreadIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentReportID: string;
};

function MoneyRequestReportTransactionsNavigation({currentReportID}: MoneyRequestReportRHPNavigationButtonsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const [reportIDsList = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_REPORT_IDS, {
        canBeMissing: true,
    });

    const {prevReportID, nextReportID} = useMemo(() => {
        if (!reportIDsList || reportIDsList.length < 2) {
            return {prevReportID: undefined, nextReportID: undefined};
        }

        const currentReportIndex = reportIDsList.findIndex((id) => id === currentReportID);

        const prevID = currentReportIndex > 0 ? reportIDsList.at(currentReportIndex - 1) : undefined;
        const nextID = currentReportIndex <= reportIDsList.length - 1 ? reportIDsList.at(currentReportIndex + 1) : undefined;

        return {prevReportID: prevID, nextReportID: nextID};
    }, [currentReportID, reportIDsList]);

    const backTo = Navigation.getActiveRoute();

    /**
     * We clear the sibling transactionThreadIDs when unmounting this component
     * only when the mount actually goes to a different SCREEN (and not a different version of the same SCREEN)
     */
    useEffect(() => {
        return () => {
            const focusedRoute = findFocusedRoute(navigationRef.getRootState());
            if (focusedRoute?.name === SCREENS.SEARCH.REPORT_RHP) {
                return;
            }
            clearActiveTransactionThreadIDs();
        };
    }, []);

    if (reportIDsList.length < 2) {
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
