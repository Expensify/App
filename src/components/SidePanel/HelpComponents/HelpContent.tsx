import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderGap from '@components/HeaderGap';
import ScrollView from '@components/ScrollView';
import getHelpContent from '@components/SidePanel/getHelpContent';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {getOneTransactionThreadReportAction, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getHelpPaneReportType} from '@libs/ReportUtils';
import {getExpenseType} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Screen} from '@src/SCREENS';
import HelpHeader from './HelpHeader';

type HelpContentProps = {
    closeSidePanel: (shouldUpdateNarrow?: boolean) => void;
};

function HelpContent({closeSidePanel}: HelpContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const [expandedIndex, setExpandedIndex] = useState(0);

    const {params, routeName, currentState} = useRootNavigationState((rootState) => {
        const focusedRoute = findFocusedRoute(rootState);
        setExpandedIndex(0);
        return {
            routeName: (focusedRoute?.name ?? '') as Screen,
            params: focusedRoute?.params as Record<string, string>,
            currentState: rootState,
        };
    });

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${params?.reportID || String(CONST.DEFAULT_NUMBER_ID)}`, {canBeMissing: true});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {canBeMissing: true});
    const [parentIOUReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`, {
        canBeMissing: true,
        selector: (actions) =>
            Object.values(actions ?? {})
                .filter((action) => action.reportActionID === report?.parentReportActionID)
                .filter(isMoneyRequestAction)
                .at(0),
    });

    const transactionID = useMemo(() => {
        const transactionThreadReportAction = getOneTransactionThreadReportAction(report, chatReport, reportActions ?? []);
        return getOriginalMessage(parentIOUReportAction ?? transactionThreadReportAction)?.IOUTransactionID;
    }, [report, chatReport, reportActions, parentIOUReportAction]);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});

    const route = useMemo(() => {
        const path = normalizedConfigs[routeName]?.path;

        if (!path) {
            return '';
        }

        const cleanedPath = path.replaceAll('?', '');
        const expenseType = getExpenseType(transaction);
        const reportType = getHelpPaneReportType(report);

        if (expenseType && reportType !== CONST.REPORT.HELP_TYPE.EXPENSE_REPORT) {
            return cleanedPath.replaceAll(':reportID', `:${CONST.REPORT.HELP_TYPE.EXPENSE}/:${expenseType}`);
        }

        if (reportType) {
            return cleanedPath.replaceAll(':reportID', `:${reportType}`);
        }

        return cleanedPath;
    }, [routeName, transaction, report]);

    const wasPreviousNarrowScreen = useRef(!isExtraLargeScreenWidth);
    useEffect(() => {
        // Close the Side Panel when the screen size changes from large to small
        if (!isExtraLargeScreenWidth && !wasPreviousNarrowScreen.current) {
            closeSidePanel(true);
            wasPreviousNarrowScreen.current = true;
        }

        // Reset the trigger when the screen size changes back to large
        if (isExtraLargeScreenWidth) {
            wasPreviousNarrowScreen.current = false;
        }
    }, [isExtraLargeScreenWidth, closeSidePanel]);

    return (
        <>
            <HeaderGap />
            <HelpHeader
                title={translate('common.help')}
                onBackButtonPress={() => closeSidePanel(false)}
                onCloseButtonPress={() => closeSidePanel(false)}
                shouldShowBackButton={!isExtraLargeScreenWidth}
                shouldShowCloseButton={isExtraLargeScreenWidth}
            />
            {currentState === undefined ? (
                <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            ) : (
                <ScrollView
                    style={[styles.ph5, styles.pb5]}
                    scrollIndicatorInsets={{right: Number.MIN_VALUE}}
                >
                    {getHelpContent(styles, route, isProduction, expandedIndex, setExpandedIndex)}
                </ScrollView>
            )}
        </>
    );
}

HelpContent.displayName = 'HelpContent';

export default HelpContent;
