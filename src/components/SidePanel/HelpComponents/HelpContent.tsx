import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {useOnyx} from 'react-native-onyx';
// Importing from the react-native-gesture-handler package instead of the `components/ScrollView` to fix scroll issue:
// https://github.com/react-native-modal/react-native-modal/issues/236
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getHelpContent from '@components/SidePanel/getHelpContent';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useThemeStyles from '@hooks/useThemeStyles';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {navigationRef} from '@libs/Navigation/Navigation';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getHelpPaneReportType} from '@libs/ReportUtils';
import {getExpenseType} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Screen} from '@src/SCREENS';

type HelpContentProps = {
    closeSidePanel: (shouldUpdateNarrow?: boolean) => void;
};

function HelpContent({closeSidePanel}: HelpContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const [expandedIndex, setExpandedIndex] = useState(0);

    const {params, routeName} = useRootNavigationState(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        setExpandedIndex(0);

        return {
            routeName: (focusedRoute?.name ?? '') as Screen,
            params: focusedRoute?.params as Record<string, string>,
        };
    });

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${params?.reportID || String(CONST.DEFAULT_NUMBER_ID)}`, {canBeMissing: true});
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`, {
        canEvict: false,
        canBeMissing: true,
    });
    const parentReportAction = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
    const linkedTransactionID = useMemo(() => (isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined), [parentReportAction]);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`, {canBeMissing: true});

    const route = useMemo(() => {
        const path = normalizedConfigs[routeName]?.path;

        if (!path) {
            return '';
        }

        const cleanedPath = path.replaceAll('?', '');
        const expenseType = getExpenseType(transaction);
        const reportOverride = expenseType ? `:${CONST.REPORT.HELP_TYPE.EXPENSE}/:${expenseType}` : `:${getHelpPaneReportType(report)}`;
        return cleanedPath.replaceAll(':reportID', reportOverride);
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
            <HeaderWithBackButton
                title={translate('common.help')}
                onBackButtonPress={() => closeSidePanel(false)}
                onCloseButtonPress={() => closeSidePanel(false)}
                shouldShowBackButton={!isExtraLargeScreenWidth}
                shouldShowCloseButton={isExtraLargeScreenWidth}
                shouldDisplayHelpButton={false}
            />
            <ScrollView
                style={[styles.ph5, styles.pb5]}
                userSelect="auto"
                scrollIndicatorInsets={{right: Number.MIN_VALUE}}
            >
                {getHelpContent(styles, route, isProduction, expandedIndex, setExpandedIndex)}
            </ScrollView>
        </>
    );
}

HelpContent.displayName = 'HelpContent';

export default HelpContent;
