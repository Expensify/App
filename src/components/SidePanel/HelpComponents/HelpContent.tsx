import {findFocusedRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ActivityIndicator from '@components/ActivityIndicator';
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
import type {ReportAction, ReportActions} from '@src/types/onyx';
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
        // Safe handling when navigation is not yet initialized
        if (!rootState) {
            return {
                routeName: '' as Screen,
                params: {} as Record<string, string>,
                currentState: undefined,
            };
        }

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

    const getParentIOUReportActionSelector = useCallback(
        (actions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> => {
            return Object.values(actions ?? {})
                .filter((action) => action.reportActionID === report?.parentReportActionID)
                .find(isMoneyRequestAction);
        },
        [report?.parentReportActionID],
    );

    const [parentIOUReportAction] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`,
        {
            canBeMissing: true,
            selector: getParentIOUReportActionSelector,
        },
        [getParentIOUReportActionSelector],
    );

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
            <HelpHeader
                title={translate('common.help')}
                onBackButtonPress={() => closeSidePanel(false)}
                onCloseButtonPress={() => closeSidePanel(false)}
                shouldShowBackButton={!isExtraLargeScreenWidth}
                shouldShowCloseButton={isExtraLargeScreenWidth}
            />
            {currentState === undefined ? (
                <View style={[styles.flex1, styles.fullScreenLoading]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
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

export default HelpContent;
