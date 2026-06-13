import React, {memo, useCallback, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import LHNEmptyState from '@components/LHNOptionsList/LHNEmptyState';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useSidebarOrderedReportsActions} from '@hooks/useSidebarOrderedReports';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSidebarLoaded} from '@libs/actions/App';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import * as ReportActionContextMenu from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

type SidebarLinksProps = {
    /** Safe area insets required for mobile devices margins */
    insets: EdgeInsets;

    /** List of options to display */
    optionListItems: Report[];

    /** The chat priority mode */
    priorityMode?: OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>;

    /** Method to change currently active report */
    isActiveReport: (reportID: string) => boolean;
};

function SidebarLinks({insets, optionListItems, priorityMode = CONST.PRIORITY_MODE.DEFAULT, isActiveReport}: SidebarLinksProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {setStickyReportID} = useSidebarOrderedReportsActions();

    useEffect(() => {
        ReportActionContextMenu.hideContextMenu(false);
    }, []);

    /**
     * Show Report page with selected report id
     */
    const showReportPage = useCallback(
        (option: Report & Pick<OptionData, 'actionTargetReportActionID'>) => {
            // Prevent opening Report page when clicking LHN row quickly after clicking FAB icon
            // or when clicking the active LHN row on large screens
            // or when continuously clicking different LHNs, only apply to small screen
            // since getTopmostReportId always returns on other devices
            const reportActionID = Navigation.getTopmostReportActionId();
            const actionTargetReportActionID = option.actionTargetReportActionID;

            // Prevent opening a new Report page if the user quickly taps on another conversation
            // before the first one is displayed.
            const shouldBlockReportNavigation = Navigation.getActiveRoute() !== `/${ROUTES.INBOX}` && shouldUseNarrowLayout;

            if (
                (option.reportID === Navigation.getTopmostReportId() && !reportActionID && !actionTargetReportActionID) ||
                (shouldUseNarrowLayout && isActiveReport(option.reportID) && !reportActionID && !actionTargetReportActionID) ||
                shouldBlockReportNavigation
            ) {
                cancelSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${option.reportID}`);
                return;
            }
            // Keep this report visible in the active To-do/Unread tab even after opening it marks it read.
            setStickyReportID(option.reportID);
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(option.reportID, actionTargetReportActionID));
        },
        [shouldUseNarrowLayout, isActiveReport, setStickyReportID],
    );

    const viewMode = priorityMode === CONST.PRIORITY_MODE.GSD ? CONST.OPTION_MODE.COMPACT : CONST.OPTION_MODE.DEFAULT;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const contentContainerStyles = useMemo(() => StyleSheet.flatten([styles.pt2, {paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}]), [insets]);

    const shouldShowEmptyLHN = optionListItems.length === 0;

    return (
        <View style={[styles.flex1, styles.h100]}>
            <View style={[styles.pRelative, styles.flex1]}>
                {shouldShowEmptyLHN ? (
                    <View style={[styles.flex1, styles.emptyLHNWrapper]}>
                        <LHNEmptyState />
                    </View>
                ) : (
                    <LHNOptionsList
                        style={styles.flex1}
                        contentContainerStyles={contentContainerStyles}
                        data={optionListItems}
                        onSelectRow={showReportPage}
                        shouldDisableFocusOptions={shouldUseNarrowLayout}
                        optionMode={viewMode}
                        onFirstItemRendered={setSidebarLoaded}
                    />
                )}
            </View>
        </View>
    );
}

export default memo(SidebarLinks);
