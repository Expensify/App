import useHover from '@hooks/useHover';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation from '@libs/Navigation/Navigation';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getReportAction, isReportActionVisible} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction as canUserPerformWriteActionReportUtils, getPolicyExpenseChat, isExpenseReport, isMoneyRequestReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {ParentNavigationSummaryParams} from '@src/languages/params';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type {ColorValue, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';
import {getReportHasParentAccess} from '@selectors/Report';
import {reportVisibleActionsSelector} from '@selectors/ReportAction';
import React from 'react';
import {View} from 'react-native';

import StatusBadge from './StatusBadge';
import Text from './Text';
import TextLink from './TextLink';

type ParentNavigationSubtitleProps = {
    parentNavigationSubtitleData: ParentNavigationSummaryParams;

    /** Current Report ID (to check hasParentAccess) */
    reportID?: string;

    parentReportID?: string;
    parentReportActionID?: string;
    pressableStyles?: StyleProp<TextStyle>;

    /** Whether to open the parent report link in the current tab if possible */
    openParentReportInCurrentTab?: boolean;

    /** The status text of the expense report */
    statusText?: string;

    /** Text to display in a tooltip shown on hover of the status badge */
    statusTooltipText?: string;

    textStyles?: StyleProp<TextStyle>;
    statusTextBackgroundColor?: ColorValue;
    statusTextColor?: ColorValue;
    statusTextContainerStyles?: StyleProp<ViewStyle>;
    subtitleNumberOfLines?: number;

    /** AccountID of the human agent assisting Concierge, gates the "- assisted by [...]" suffix */
    humanAgentAccountID?: number;

    /** Display name of the human agent; falls back to a generic label when missing */
    humanAgentName?: string;

    shouldShowFromPrefix?: boolean;
};

/** Picks the fields that find a report's parent, so the subtitle doesn't re-render when other fields of the report change */
function parentNavigationReportSelector(report: OnyxEntry<Report>) {
    return report && {hasParentAccess: getReportHasParentAccess(report), isExpenseReport: isExpenseReport(report), ownerAccountID: report.ownerAccountID, policyID: report.policyID};
}

function ParentNavigationSubtitle({
    parentNavigationSubtitleData,
    reportID = '',
    parentReportActionID,
    parentReportID = '',
    pressableStyles,
    openParentReportInCurrentTab = false,
    statusText,
    statusTooltipText,
    textStyles,
    statusTextBackgroundColor,
    statusTextColor,
    statusTextContainerStyles,
    subtitleNumberOfLines = 1,
    humanAgentAccountID,
    humanAgentName,
    shouldShowFromPrefix = true,
}: ParentNavigationSubtitleProps) {
    const currentRoute = useRoute();
    // We intentionally use isSmallScreenWidth (real device width), not shouldUseNarrowLayout — the latter is
    // true whenever this component renders inside an RHP, which would always block the super-wide path below.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {
        hovered,
        bind: {onMouseEnter, onMouseLeave},
    } = useHover();

    const {workspaceName, reportName} = parentNavigationSubtitleData;
    const {translate} = useLocalize();
    const [currentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: parentNavigationReportSelector});
    const hasParentAccess = currentReport?.hasParentAccess;
    const policyExpenseChat = !parentReportID && currentReport?.isExpenseReport ? getPolicyExpenseChat(currentReport.ownerAccountID, currentReport.policyID) : undefined;
    const parentNavigationReportID = parentReportID || policyExpenseChat?.reportID;
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(parentReportID)}`);
    const report = parentReport ?? policyExpenseChat;
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {selector: reportVisibleActionsSelector(parentNavigationReportID)});
    const isReportArchived = useReportIsArchived(report?.reportID);
    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report, isReportArchived);
    const hasAccessToParentReport = !!parentNavigationReportID && hasParentAccess !== false;
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
    const isReportInRHP =
        currentRoute.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT ||
        (currentRoute.params &&
            'reportID' in currentRoute.params &&
            currentFocusedNavigator?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR &&
            currentFullScreenRoute?.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);

    // We should not display the parent navigation subtitle if the user does not have access to the parent chat (the reportName is empty in this case)
    if (!reportName) {
        return;
    }

    const onPress = () => {
        if (!parentNavigationReportID) {
            return;
        }

        const parentAction = getReportAction(parentNavigationReportID, parentReportActionID);
        const isVisibleAction = isReportActionVisible(parentAction, parentNavigationReportID, canUserPerformWriteAction, visibleReportActionsData);

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
                        if (moneyRequestReportID === parentNavigationReportID) {
                            Navigation.goBack();
                            return;
                        }
                    }
                }

                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: parentNavigationReportID}));
                return;
            }

            if (Navigation.getTopmostSuperWideRHPReportID() === parentNavigationReportID && currentFullScreenRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                Navigation.dismissToSuperWideRHP();
                return;
            }

            // If the parent report is already displayed underneath RHP, simply dismiss the modal
            if (Navigation.getTopmostReportId() === parentNavigationReportID && currentFullScreenRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                Navigation.dismissModal();
                return;
            }
        }

        if (openParentReportInCurrentTab && currentFocusedNavigator?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            const lastRoute = currentFocusedNavigator?.state?.routes.at(-1);

            // Deduplication must run before the navigate-to-parent branches below: when the parent report is already the
            // previous RHP in the stack, go back to it instead of pushing a new copy. Otherwise hopping parent <->
            // child repeatedly (e.g. workspace chat <-> expense report from Home) stacks [chat, report, chat,
            // report, …] in history, forcing the back button to walk through every duplicate.
            const previousRoute = currentFocusedNavigator?.state?.routes.at(-2);

            if (
                (previousRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || previousRoute?.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT) &&
                previousRoute.params &&
                'reportID' in previousRoute.params &&
                previousRoute.params.reportID === parentNavigationReportID
            ) {
                Navigation.goBack();
                return;
            }

            // When viewing a money request report in an RHP, open its parent (the workspace chat) as another RHP
            // instead of navigating away full-page. This mirrors the Search flow (SEARCH_MONEY_REQUEST_REPORT). The
            // EXPENSE_REPORT case is scoped to the Home tab — in the Reports/Inbox tab the parent chat is the
            // fullscreen underneath, so the dismiss-to-reveal logic below should handle it instead.
            if (
                lastRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT ||
                (lastRoute?.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT && currentFullScreenRoute?.name === SCREENS.HOME)
            ) {
                const backTo = currentFullScreenRoute?.name === SCREENS.HOME ? Navigation.getActiveRoute() : undefined;
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: parentNavigationReportID, reportActionID: parentReportActionID, backTo}));
                return;
            }

            // When the parent report is already the topmost route in the tab underneath the RHP,
            // update its reportActionID and dismiss the modal instead of pushing a new instance
            // on top of the tab navigator.
            if (currentFullScreenRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                const fullScreenState = currentFullScreenRoute.state;
                const topRoute = fullScreenState?.routes?.[fullScreenState.index ?? 0];
                const topRouteReportID = topRoute?.params && 'reportID' in topRoute.params ? String(topRoute.params.reportID) : undefined;

                if (topRouteReportID === parentNavigationReportID && topRoute?.key && fullScreenState?.key) {
                    if (isVisibleAction && parentReportActionID) {
                        Navigation.setParams({reportActionID: parentReportActionID}, topRoute.key, fullScreenState.key);
                    }
                    Navigation.dismissModal();
                    return;
                }
            }

            // Stay in the Search tab when the parent link is tapped from a SEARCH_REPORT RHP
            // and the parent isn't already in the stack — otherwise the REPORT_WITH_ID fallback
            // would yank the user to Inbox.
            if (isReportInRHP) {
                if (!isSmallScreenWidth && isMoneyRequestReport(report)) {
                    Navigation.navigate(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: parentNavigationReportID}));
                    return;
                }

                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: parentNavigationReportID, reportActionID: isVisibleAction ? parentReportActionID : undefined}));
                return;
            }
        }

        // If the parent report is already the previous screen in the main stack, go back to it
        // and update its params instead of pushing a new instance. Without this check, repeatedly
        // tapping the subtitle link builds up a [DM, Expense, DM, Expense, …] stack that traps
        // the user after an expense is deleted.
        if ((currentReportIndex ?? 0) > 0 && focusedNavigatorState?.key && currentFocusedNavigator?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
            const prevRoute = focusedNavigatorState.routes[(currentReportIndex ?? 0) - 1];
            const prevRouteReportID = prevRoute?.params && 'reportID' in prevRoute.params ? String(prevRoute.params.reportID) : undefined;

            if (prevRouteReportID === parentNavigationReportID && prevRoute?.key) {
                if (isVisibleAction && parentReportActionID) {
                    // Set params on the background screen first so it is already correct when revealed.
                    Navigation.setParams({reportActionID: parentReportActionID}, prevRoute.key, focusedNavigatorState.key);
                }
                Navigation.goBack();
                return;
            }
        }

        if (isVisibleAction) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(parentNavigationReportID, parentReportActionID));
        } else {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(parentNavigationReportID));
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
                    tooltipText={statusTooltipText}
                />
            )}
            <Text
                style={[styles.optionAlternateText, styles.textLabelSupporting, styles.flexShrink1, styles.mnw0, textStyles]}
                numberOfLines={subtitleNumberOfLines}
            >
                {!!reportName && (
                    <>
                        {shouldShowFromPrefix && <Text style={[styles.optionAlternateText, styles.textLabelSupporting, textStyles]}>{`${translate('threads.from')} `}</Text>}
                        {hasAccessToParentReport ? (
                            <TextLink
                                testID="parent-navigation-subtitle-link"
                                onMouseEnter={onMouseEnter}
                                onMouseLeave={onMouseLeave}
                                onPress={onPress}
                                accessibilityLabel={translate('threads.parentNavigationSummary', reportName, workspaceName)}
                                style={[
                                    pressableStyles,
                                    styles.optionAlternateText,
                                    styles.textLabelSupporting,
                                    textStyles,
                                    hovered ? StyleUtils.getColorStyle(theme.linkHover) : styles.link,
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
