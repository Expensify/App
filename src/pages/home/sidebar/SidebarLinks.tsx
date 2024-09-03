import React, {memo, useCallback, useEffect, useMemo} from 'react';
import {InteractionManager, StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

type SidebarLinksProps = {
    /** Toggles the navigation menu open and closed */
    onLinkClick: () => void;

    /** Safe area insets required for mobile devices margins */
    insets: EdgeInsets;

    /** List of options to display */
    optionListItems: string[];

    /** Whether the reports are loading. When false it means they are ready to be used. */
    isLoading: OnyxEntry<boolean>;

    /** The chat priority mode */
    priorityMode?: OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>;

    /** Method to change currently active report */
    isActiveReport: (reportID: string) => boolean;

    /** ID of currently active workspace */
    // eslint-disable-next-line react/no-unused-prop-types -- its used in withOnyx
    activeWorkspaceID: string | undefined;
};

function SidebarLinks({onLinkClick, insets, optionListItems, isLoading, priorityMode = CONST.PRIORITY_MODE.DEFAULT, isActiveReport}: SidebarLinksProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {updateLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        App.confirmReadyToOpenApp();
    }, []);

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                updateLocale();
            });
        });

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
            if ((option.reportID === Navigation.getTopmostReportId() && !reportActionID) || (shouldUseNarrowLayout && isActiveReport(option.reportID) && !reportActionID)) {
                return;
            }
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(option.reportID));
            onLinkClick();
        },
        [shouldUseNarrowLayout, isActiveReport, onLinkClick],
    );

    const viewMode = priorityMode === CONST.PRIORITY_MODE.GSD ? CONST.OPTION_MODE.COMPACT : CONST.OPTION_MODE.DEFAULT;

    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    const contentContainerStyles = useMemo(() => StyleSheet.flatten([styles.sidebarListContainer, {paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}]), [insets]);

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
                    onFirstItemRendered={App.setSidebarLoaded}
                />
                {isLoading && optionListItems?.length === 0 && (
                    <View style={[StyleSheet.absoluteFillObject, styles.appBG]}>
                        <OptionsListSkeletonView shouldAnimate />
                    </View>
                )}
            </View>
        </View>
    );
}

SidebarLinks.displayName = 'SidebarLinks';

export default memo(SidebarLinks);
