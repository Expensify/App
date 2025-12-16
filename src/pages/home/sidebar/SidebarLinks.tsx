import React, {memo, useCallback, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {confirmReadyToOpenApp, setSidebarLoaded} from '@libs/actions/App';
import Navigation from '@libs/Navigation/Navigation';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

type SidebarLinksProps = {
    /** Safe area insets required for mobile devices margins */
    insets: EdgeInsets;

    /** List of options to display */
    optionListItems: Report[];

    /** Whether the reports are loading. When false it means they are ready to be used. */
    isLoading: OnyxEntry<boolean>;

    /** The chat priority mode */
    priorityMode?: OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>;

    /** Method to change currently active report */
    isActiveReport: (reportID: string) => boolean;
};

function SidebarLinks({insets, optionListItems, isLoading, priorityMode = CONST.PRIORITY_MODE.DEFAULT, isActiveReport}: SidebarLinksProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        confirmReadyToOpenApp();
    }, []);

    useEffect(() => {
        ReportActionContextMenu.hideContextMenu(false);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    /**
     * Show Report page with selected report id
     */
    const showReportPage = useCallback(
        (option: Report) => {
            // Prevent opening Report page when clicking LHN row quickly after clicking FAB icon
            // or when clicking the active LHN row on large screens
            // or when continuously clicking different LHNs, only apply to small screen
            // since getTopmostReportId always returns on other devices
            const reportActionID = Navigation.getTopmostReportActionId();

            // Prevent opening a new Report page if the user quickly taps on another conversation
            // before the first one is displayed.
            const shouldBlockReportNavigation = Navigation.getActiveRoute() !== '/home' && shouldUseNarrowLayout;

            if (
                (option.reportID === Navigation.getTopmostReportId() && !reportActionID) ||
                (shouldUseNarrowLayout && isActiveReport(option.reportID) && !reportActionID) ||
                shouldBlockReportNavigation
            ) {
                cancelSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${option.reportID}`);
                return;
            }
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(option.reportID));
        },
        [shouldUseNarrowLayout, isActiveReport],
    );

    const viewMode = priorityMode === CONST.PRIORITY_MODE.GSD ? CONST.OPTION_MODE.COMPACT : CONST.OPTION_MODE.DEFAULT;

    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    const contentContainerStyles = useMemo(() => StyleSheet.flatten([styles.pt2, {paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}]), [insets]);

    return (
        <View style={[styles.flex1, styles.h100]}>
            <View style={[styles.pRelative, styles.flex1]}>
                <LHNOptionsList
                    style={styles.flex1}
                    contentContainerStyles={contentContainerStyles}
                    data={optionListItems}
                    onSelectRow={showReportPage}
                    shouldDisableFocusOptions={shouldUseNarrowLayout}
                    optionMode={viewMode}
                    onFirstItemRendered={setSidebarLoaded}
                />
                {!!isLoading && optionListItems?.length === 0 && (
                    <View style={[StyleSheet.absoluteFillObject, styles.appBG, styles.mt3]}>
                        <OptionsListSkeletonView shouldAnimate />
                    </View>
                )}
            </View>
        </View>
    );
}

SidebarLinks.displayName = 'SidebarLinks';

export default memo(SidebarLinks);
