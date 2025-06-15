import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import {clearActiveTransactionThreadIDs, getActiveTransactionThreadIDs} from './TransactionThreadReportIDRepository';

type MoneyRequestReportRHPNavigationButtonsProps = {
    /** The report for which we are displaying the navigation buttons */
    report: OnyxEntry<Report>;

    /** The route to navigate back to when the user clicks on the back button */
    backTo?: string;
};

function MoneyRequestReportTransactionsNavigation({report, backTo}: MoneyRequestReportRHPNavigationButtonsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const reportIDsList = getActiveTransactionThreadIDs();
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`, {
        canBeMissing: true,
        selector: (reportActions) => Object.values(reportActions ?? {}),
    });

    const {prevReportID, prevParentReportActionID, nextReportID, nextParentReportActionID} = (() => {
        if (!reportIDsList) {
            return {prevReportID: undefined, prevParentReportActionID: undefined, nextReportID: undefined, nextParentReportActionID: undefined};
        }

        const currentReportIndex = reportIDsList.findIndex((id) => id === report?.reportID);

        const prevID = currentReportIndex > 0 ? reportIDsList.at(currentReportIndex - 1) : undefined;
        const nextID = currentReportIndex <= reportIDsList.length - 1 ? reportIDsList.at(currentReportIndex + 1) : undefined;
        const prevReportActionID = currentReportIndex > 0 ? parentReportActions?.find((action) => action.childReportID === prevID)?.reportActionID : undefined;
        const nextReportActionID = currentReportIndex <= reportIDsList.length - 1 ? parentReportActions?.find((action) => action.childReportID === nextID)?.reportActionID : undefined;

        return {prevReportID: prevID, prevParentReportActionID: prevReportActionID, nextReportID: nextID, nextParentReportActionID: nextReportActionID};
    })();

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
                    Navigation.navigate(
                        ROUTES.SEARCH_REPORT.getRoute({reportID: prevReportID, parentReportActionID: prevParentReportActionID, parentReportID: report?.parentReportID, backTo}),
                        {
                            forceReplace: true,
                        },
                    );
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
                    Navigation.navigate(
                        ROUTES.SEARCH_REPORT.getRoute({reportID: nextReportID, parentReportActionID: nextParentReportActionID, parentReportID: report?.parentReportID, backTo}),
                        {forceReplace: true},
                    );
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
