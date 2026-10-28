import LHNEmptyState from '@components/LHNOptionsList/LHNEmptyState';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import useTabRootScrollProps from '@components/Navigation/TabBarBottomContent/useTabRootScrollProps';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';

import useOnyx from '@hooks/useOnyx';
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
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';

import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

type SidebarLinksProps = {
    /** Safe area insets required for mobile devices margins */
    insets: EdgeInsets;

    /** The ordered IDs of the reports to show in the LHN */
    reportIDs: string[];

    /** Whether the full (unfiltered) LHN report set is empty. Used to distinguish an Onyx-cleared reload from a per-tab empty view. */
    hasReportData: boolean;

    /** The chat priority mode */
    priorityMode?: OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>;

    /**
     * Header to render as the list's first item. When set, it must also be rendered in the branches that show no list at all (empty LHN),
     * otherwise the screen loses its header entirely.
     */
    listHeaderComponent?: React.ReactNode;
};

function SidebarLinks({insets, reportIDs, hasReportData, priorityMode = CONST.PRIORITY_MODE.DEFAULT, listHeaderComponent}: SidebarLinksProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const {setStickyReportID} = useSidebarOrderedReportsActions();
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);

    useEffect(() => {
        ReportActionContextMenu.hideContextMenu(false);
    }, []);

    /**
     * Show Report page with selected report id
     */
    const showReportPage = (option: Report & Pick<OptionData, 'actionTargetReportActionID'>) => {
        // Prevent opening Report page when clicking LHN row quickly after clicking FAB icon
        // or when clicking the active LHN row on large screens
        // or when continuously clicking different LHNs, only apply to small screen
        // since getTopmostReportId always returns on other devices
        const reportActionID = Navigation.getTopmostReportActionId();
        const actionTargetReportActionID = option.actionTargetReportActionID;

        // When the sidebar is focused on narrow screens, force navigation to bypass stale report IDs.
        // Otherwise, only block navigation if the report is already open or initial data is still loading.
        const shouldBlockReportNavigation = shouldUseNarrowLayout
            ? Navigation.getActiveRoute() !== `/${ROUTES.INBOX}`
            : option.reportID === Navigation.getTopmostReportId() && !reportActionID && !actionTargetReportActionID;

        if (shouldBlockReportNavigation) {
            cancelSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${option.reportID}`);
            return;
        }
        // Keep this report visible in the active To-do/Unread tab even after opening it marks it read.
        setStickyReportID(option.reportID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(option.reportID, actionTargetReportActionID));
    };

    const viewMode = priorityMode === CONST.PRIORITY_MODE.GSD ? CONST.OPTION_MODE.COMPACT : CONST.OPTION_MODE.DEFAULT;

    const contentContainerStyles = StyleSheet.flatten([styles.pt2, {paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}]);

    const shouldShowEmptyLHN = reportIDs.length === 0;
    const {contentContainerStyle: emptyLHNStyle} = useTabRootScrollProps([styles.flex1, isInLandscapeMode ? styles.pv4 : styles.emptyLHNWrapper], {fillsVisibleArea: true});

    // Show the loading skeleton only while report data is loading AND the entire LHN report set is empty
    // (e.g. switching accounts/delegate sessions or re-authenticating after an Onyx clear, where openApp() repopulates reports).
    // Gating on the unfiltered set — rather than the current tab's filtered list — avoids the reconnect flash on the
    // Unread/To-do tabs, where the filtered list is legitimately empty while reports still exist.
    const shouldShowLoadingSkeleton = isLoadingReportData && !hasReportData;

    const loadingSkeleton = shouldShowLoadingSkeleton && (
        <View style={[StyleSheet.absoluteFill, styles.appBG, styles.mt3]}>
            <OptionsListSkeletonView shouldAnimate />
        </View>
    );

    // The skeleton covers its whole container, so where the header is rendered above the empty state it has to cover
    // only the area below the header. Otherwise the screen loses its header while loading.
    const shouldShowSkeletonBelowHeader = shouldShowEmptyLHN && !!listHeaderComponent;

    return (
        <View style={[styles.flex1, styles.h100]}>
            <View style={[styles.pRelative, styles.flex1]}>
                {shouldShowEmptyLHN ? (
                    <>
                        {listHeaderComponent}
                        <View style={[styles.pRelative, styles.flex1]}>
                            <View style={emptyLHNStyle}>
                                <LHNEmptyState />
                            </View>
                            {shouldShowSkeletonBelowHeader && loadingSkeleton}
                        </View>
                    </>
                ) : (
                    <LHNOptionsList
                        style={styles.flex1}
                        contentContainerStyles={contentContainerStyles}
                        data={reportIDs}
                        onSelectRow={showReportPage}
                        shouldDisableFocusOptions={shouldUseNarrowLayout}
                        optionMode={viewMode}
                        onFirstItemRendered={setSidebarLoaded}
                        listHeaderComponent={listHeaderComponent}
                    />
                )}
                {!shouldShowSkeletonBelowHeader && loadingSkeleton}
            </View>
        </View>
    );
}

export default SidebarLinks;
