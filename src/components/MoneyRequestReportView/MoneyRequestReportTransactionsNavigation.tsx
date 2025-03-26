import React, {useMemo} from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {getActiveTransactionReportIDs} from './TransactionReportIDRepository';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentReportID: string;
};

function MoneyRequestReportTransactionsNavigation({currentReportID}: MoneyRequestReportRHPNavigationButtonsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

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
                accessibilityRole="button"
                accessible
                accessibilityLabel="button"
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
                accessibilityRole="button"
                accessible
                accessibilityLabel="button"
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
