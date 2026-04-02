import React, {memo, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import useNavigateToReportFromLHN from '@hooks/useNavigateToReportFromLHN';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSidebarLoaded} from '@libs/actions/App';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import * as ReportActionContextMenu from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);

    const showReportPage = useNavigateToReportFromLHN(isActiveReport);

    useEffect(() => {
        ReportActionContextMenu.hideContextMenu(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; ReportActionContextMenu is stable module API
    }, []);

    const viewMode = priorityMode === CONST.PRIORITY_MODE.GSD ? CONST.OPTION_MODE.COMPACT : CONST.OPTION_MODE.DEFAULT;

    const sidebarSkeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'SidebarLinks',
        isLoadingReportData,
        optionListItemsCount: optionListItems?.length,
    };

    const contentContainerStyles = useMemo(() => StyleSheet.flatten([styles.pt2, {paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}]), [insets, styles.pt2, StyleUtils]);

    return (
        <View style={[styles.flex1, styles.h100, styles.pRelative]}>
            <LHNOptionsList
                style={styles.flex1}
                contentContainerStyles={contentContainerStyles}
                data={optionListItems}
                onSelectRow={showReportPage}
                shouldDisableFocusOptions={shouldUseNarrowLayout}
                optionMode={viewMode}
                onFirstItemRendered={setSidebarLoaded}
            />
            {isLoadingReportData && optionListItems?.length === 0 && (
                <View style={[StyleSheet.absoluteFill, styles.appBG, styles.mt3]}>
                    <OptionsListSkeletonView
                        shouldAnimate
                        reasonAttributes={sidebarSkeletonReasonAttributes}
                    />
                </View>
            )}
        </View>
    );
}

export default memo(SidebarLinks);
