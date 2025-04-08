import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef} from 'react';
// Importing from the react-native-gesture-handler package instead of the `components/ScrollView` to fix scroll issue:
// https://github.com/react-native-modal/react-native-modal/issues/236
import {ScrollView} from 'react-native-gesture-handler';
import {useOnyx} from 'react-native-onyx';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getHelpContent from '@components/SidePanel/getHelpContent';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getHelpPaneReportType} from '@libs/ReportUtils';
import {substituteRouteParameters} from '@libs/SidePanelUtils';
import {getExpenseType} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type HelpContentProps = {
    closeSidePanel: (shouldUpdateNarrow?: boolean) => void;
};

function HelpContent({closeSidePanel}: HelpContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();

    const routeParams = useRootNavigationState((state) => (findFocusedRoute(state)?.params as Record<string, string>) ?? {});
    const reportID = routeParams.reportID || CONST.DEFAULT_NUMBER_ID;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID || CONST.DEFAULT_NUMBER_ID}`, {
        canEvict: false,
    });
    const parentReportAction = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
    const linkedTransactionID = useMemo(() => (isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined), [parentReportAction]);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID ?? CONST.DEFAULT_NUMBER_ID}`);

    const route = useMemo(() => {
        const expenseType = getExpenseType(transaction);
        const overrides = {reportID: expenseType ? `:${CONST.REPORT.HELP_TYPE.EXPENSE}/:${expenseType}` : `:${getHelpPaneReportType(report)}`};
        const activeRoute = Navigation.getActiveRouteWithoutParams();
        return substituteRouteParameters(activeRoute, routeParams, overrides);
    }, [transaction, report, routeParams]);

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
                style={styles.headerBarDesktopHeight}
                onBackButtonPress={() => closeSidePanel(false)}
                onCloseButtonPress={() => closeSidePanel(false)}
                shouldShowBackButton={!isExtraLargeScreenWidth}
                shouldShowCloseButton={isExtraLargeScreenWidth}
                shouldDisplayHelpButton={false}
            />
            <ScrollView
                style={[styles.ph5, styles.pb5]}
                userSelect="auto"
            >
                {getHelpContent(styles, route, isProduction)}
            </ScrollView>
        </>
    );
}

HelpContent.displayName = 'HelpContent';

export default HelpContent;
