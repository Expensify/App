import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import type {EdgeInsets} from 'react-native-safe-area-context';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import useThemeStyles from '@hooks/useThemeStyles';
import {endSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SidebarLinks from './SidebarLinks';

type SidebarLinksDataProps = {
    /** Safe area insets required for mobile devices margins */
    insets: EdgeInsets;
};

function SidebarLinksData({insets}: SidebarLinksDataProps) {
    const isFocused = useIsFocused();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [priorityMode = CONST.PRIORITY_MODE.DEFAULT] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);

    const {orderedReports, currentReportID} = useSidebarOrderedReports('SidebarLinksData');

    const currentReportIDRef = useRef(currentReportID);
    currentReportIDRef.current = currentReportID;
    const isActiveReport = useCallback((reportID: string): boolean => currentReportIDRef.current === reportID, []);

    // Guards against ending the span before the first layout has completed.
    const hasHadFirstLayout = useRef(false);
    const onLayout = useCallback(() => {
        hasHadFirstLayout.current = true;
        endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
    }, []);

    // On re-visits, react-freeze serves the cached layout — onLayout never fires.
    // useFocusEffect fires on unfreeze, which is when the screen becomes visible.
    useFocusEffect(
        useCallback(() => {
            if (!hasHadFirstLayout.current) {
                return;
            }
            endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
        }, []),
    );

    return (
        <View
            accessibilityElementsHidden={!isFocused}
            collapsable={false}
            accessibilityLabel={translate('sidebarScreen.listOfChats')}
            style={[styles.flex1, styles.h100]}
            onLayout={onLayout}
        >
            <SidebarLinks
                // Forwarded props:
                insets={insets}
                priorityMode={priorityMode ?? CONST.PRIORITY_MODE.DEFAULT}
                // Data props:
                isActiveReport={isActiveReport}
                isLoading={isLoadingApp ?? false}
                optionListItems={orderedReports}
            />
        </View>
    );
}

const WrappedSidebarLinksData = Sentry.withProfiler(SidebarLinksData);

export default WrappedSidebarLinksData;
