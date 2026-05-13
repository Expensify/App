import {useRoute} from '@react-navigation/native';
import React from 'react';
import type {ColorValue, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useHover from '@hooks/useHover';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation from '@libs/Navigation/Navigation';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getReportAction, isReportActionVisible} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction as canUserPerformWriteActionReportUtils, isMoneyRequestReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {ParentNavigationSummaryParams} from '@src/languages/params';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import StatusBadge from './StatusBadge';
import Text from './Text';
import TextLink from './TextLink';

type ParentNavigationSubtitleProps = {
    parentNavigationSubtitleData: ParentNavigationSummaryParams;

    /** Current Report ID (to check hasParentAccess) */
    reportID?: string;

    /** parent Report ID */
    parentReportID?: string;

    /** parent Report Action ID */
    parentReportActionID?: string;

    /** PressableWithoutFeedback additional styles */
    pressableStyles?: StyleProp<TextStyle>;

    /** Whether to open the parent report link in the current tab if possible */
    openParentReportInCurrentTab?: boolean;

    /** The status text of the expense report */
    statusText?: string;

    /** The style of the text */
    textStyles?: StyleProp<TextStyle>;

    /** The background color for the status text */
    statusTextBackgroundColor?: ColorValue;

    /** The text color for the status text */
    statusTextColor?: ColorValue;

    /** The style of the status text container */
    statusTextContainerStyles?: StyleProp<ViewStyle>;

    /** The number of lines for the subtitle */
    subtitleNumberOfLines?: number;

    /** AccountID of the human agent assisting Concierge, gates the "- assisted by [...]" suffix */
    humanAgentAccountID?: number;

    /** Display name of the human agent; falls back to a generic label when missing */
    humanAgentName?: string;
};

function ParentNavigationSubtitle({
    parentNavigationSubtitleData,
    reportID = '',
    parentReportActionID,
    parentReportID = '',
    pressableStyles,
    openParentReportInCurrentTab = false,
    statusText,
    textStyles,
    statusTextBackgroundColor,
    statusTextColor,
    statusTextContainerStyles,
    subtitleNumberOfLines = 1,
    humanAgentAccountID,
    humanAgentName,
}: ParentNavigationSubtitleProps) {
    const currentRoute = useRoute();
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {
        hovered,
        bind: {onMouseEnter, onMouseLeave},
    } = useHover();

    const {workspaceName, reportName} = parentNavigationSubtitleData;
    const {translate} = useLocalize();
    const [currentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report, isReportArchived);
    const isReportInRHP = currentRoute.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT;
    const hasAccessToParentReport = currentReport?.hasParentAccess !== false;
    const {currentFullScreenRoute, currentFocusedNavigator} = useRootNavigationState((state) => {
        // Find the tab navigator, which wraps all full-screen navigators
        const tabNavigatorRoute = state?.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
        const tabState = tabNavigatorRoute?.state;

        // Get the active (focused) tab from the tab navigator as the current full-screen route
        // and fall back to the previous root-level full-screen lookup for states without tab nesting.
        const fullScreenRoute = tabState ? tabState.routes?.[tabState.index ?? 0] : state?.routes?.findLast((route) => isFullScreenName(route.name));

        // Find the outermost navigator that currently has an active screen stack
        const lastNavigatorWithRoutes = state?.routes ? state.routes.findLast((route) => route.state?.routes && route.state.routes.length > 0) : undefined;

        // If the tab navigator is focused, resolve to the active tab's navigator so that
        // focusedNavigatorState reflects the split navigator's screen stack (not the tab list).
        // If RHP is focused, use the RHP route directly so RHP-specific checks work correctly.
        const focusedNavigator = lastNavigatorWithRoutes?.name === NAVIGATORS.TAB_NAVIGATOR ? fullScreenRoute : lastNavigatorWithRoutes;

        return {
            currentFullScreenRoute: fullScreenRoute,
            currentFocusedNavigator: focusedNavigator,
        };
    });

    // We should not display the parent navigation subtitle if the user does not have access to the parent chat (the reportName is empty in this case)
    if (!reportName) {
        return;
    }

    const onPress = () => {
        const parentAction = getReportAction(parentReportID, parentReportActionID);
        const isVisibleAction = isReportActionVisible(parentAction, parentReportID, canUserPerformWriteAction, visibleReportActionsData);

        const focusedNavigatorState = currentFocusedNavigator?.state;
        const currentReportIndex = focusedNavigatorState?.index;

        if (openParentReportInCurrentTab && isReportInRHP) {
            // If the report is displayed in RHP in Reports tab, we want to stay in the current tab after opening the parent report
            if (currentFullScreenRoute?.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR && isMoneyRequestReport(report)) {
                // Dismiss wide RHP and go back to already opened super wide RHP if the parent report is already opened there
                if (currentFocusedNavigator?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR && currentReportIndex && currentReportIndex > 0) {
                    const previousRoute = focusedNavigatorState.routes[currentReportIndex - 1];

                    if (previousRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT) {
                        const moneyRequestReportID = (previousRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT])?.reportID;
                        if (moneyRequestReportID === parentReportID) {
                            Navigation.goBack();
                            return;
                        }
                    }
                }

                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: parentReportID}));
                return;
            }

            if (Navigation.getTopmostSuperWideRHPReportID() === parentReportID && currentFullScreenRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                Navigation.dismissToSuperWideRHP();
                return;
            }

            // If the parent report is already displayed underneath RHP, simply dismiss the modal
            if (Navigation.getTopmostReportId() === parentReportID && currentFullScreenRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                Navigation.dismissModal();
                return;
            }
        }

        // When viewing a money request in the search navigator, open the parent report in a right-hand pane (RHP)
        // to preserve the search context instead of navigating away.
        if (openParentReportInCurrentTab && currentFocusedNavigator?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            const lastRoute = currentFocusedNavigator?.state?.routes.at(-1);
            if (lastRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT) {
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: parentReportID, reportActionID: parentReportActionID}));
                return;
            }

            // Specific case: when opening expense report from search report (chat RHP),
            // avoid stacking RHPs by going back to the search report if it's already there
            const previousRoute = currentFocusedNavigator?.state?.routes.at(-2);

            if (previousRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT && lastRoute?.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT) {
                if (previousRoute.params && 'reportID' in previousRoute.params) {
                    const reportIDFromParams = previousRoute.params.reportID;

                    if (reportIDFromParams === parentReportID) {
                        Navigation.goBack();
                        return;
                    }
                }
            }
        }

        // If the parent report is already the previous screen in the main stack, go back to it
        // and update its params instead of pushing a new instance. Without this check, repeatedly
        // tapping the subtitle link builds up a [DM, Expense, DM, Expense, …] stack that traps
        // the user after an expense is deleted.
        if ((currentReportIndex ?? 0) > 0 && focusedNavigatorState?.key && currentFocusedNavigator?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
            const prevRoute = focusedNavigatorState.routes[(currentReportIndex ?? 0) - 1];
            const prevRouteReportID = prevRoute?.params && 'reportID' in prevRoute.params ? String(prevRoute.params.reportID) : undefined;

            if (prevRouteReportID === parentReportID && prevRoute?.key) {
                if (isVisibleAction && parentReportActionID) {
                    // Set params on the background screen first so it is already correct when revealed.
                    Navigation.setParams({reportActionID: parentReportActionID}, prevRoute.key, focusedNavigatorState.key);
                }
                Navigation.goBack();
                return;
            }
        }

        if (isVisibleAction) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(parentReportID, parentReportActionID));
        } else {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(parentReportID));
        }
    };

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100]}>
            {!!statusText && (
                <StatusBadge
                    text={statusText}
                    backgroundColor={statusTextBackgroundColor}
                    textColor={statusTextColor}
                    badgeStyles={[styles.mr1, statusTextContainerStyles]}
                />
            )}
            <Text
                style={[styles.optionAlternateText, styles.textLabelSupporting, styles.flexShrink1, styles.mnw0, textStyles]}
                numberOfLines={subtitleNumberOfLines}
            >
                {!!reportName && (
                    <>
                        <Text style={[styles.optionAlternateText, styles.textLabelSupporting, textStyles]}>{`${translate('threads.from')} `}</Text>
                        {hasAccessToParentReport ? (
                            <TextLink
                                testID="parent-navigation-subtitle-link"
                                onMouseEnter={onMouseEnter}
                                onMouseLeave={onMouseLeave}
                                onPress={onPress}
                                accessibilityLabel={translate('threads.parentNavigationSummary', {reportName, workspaceName})}
                                style={[
                                    pressableStyles,
                                    styles.optionAlternateText,
                                    styles.textLabelSupporting,
                                    hovered ? StyleUtils.getColorStyle(theme.linkHover) : styles.link,
                                    textStyles,
                                ]}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            >
                                {reportName}
                            </TextLink>
                        ) : (
                            <Text style={[styles.optionAlternateText, styles.textLabelSupporting, textStyles]}>{reportName}</Text>
                        )}
                    </>
                )}
                {!!humanAgentAccountID && (
                    <Text style={[styles.optionAlternateText, styles.textLabelSupporting, textStyles]}>
                        {` - ${translate('reportAction.assistedBy', humanAgentName ?? translate('reportAction.humanSupportAgent'))}`}
                    </Text>
                )}
                {!!workspaceName && workspaceName !== reportName && (
                    <Text style={[styles.optionAlternateText, styles.textLabelSupporting, textStyles]}>{` ${translate('threads.in')} ${workspaceName}`}</Text>
                )}
            </Text>
        </View>
    );
}

export default ParentNavigationSubtitle;
