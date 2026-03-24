import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {EdgeInsets} from 'react-native-safe-area-context';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useThemeStyles from '@hooks/useThemeStyles';
import {cancelSpan, endSpan, getSpan} from '@libs/telemetry/activeSpans';
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
    const [priorityMode = CONST.PRIORITY_MODE.DEFAULT] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);

    const {orderedReports, currentReportID} = useSidebarOrderedReportsState('SidebarLinksData');

    const currentReportIDRef = useRef(currentReportID);
    currentReportIDRef.current = currentReportID;
    const isActiveReport = useCallback((reportID: string): boolean => currentReportIDRef.current === reportID, []);

    const hasHadFirstLayout = useRef(false);
    const spanOnMount = useRef(getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB));

    const onLayout = useCallback(() => {
        hasHadFirstLayout.current = true;
        endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
        spanOnMount.current = undefined;
    }, []);

    // Focus: ends span on re-visits (react-freeze cached layout, onLayout won't fire again).
    // Blur cleanup: cancels orphaned span when user navigates away before onLayout fires.
    useFocusEffect(
        useCallback(() => {
            if (hasHadFirstLayout.current) {
                endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
            }
            return () => cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
        }, []),
    );

    // Unmount: cancel only if layout never completed AND the active span is
    // the same one that existed when this instance mounted (avoids canceling
    // a newer span started by a subsequent tab click).
    useEffect(
        () => () => {
            if (hasHadFirstLayout.current) {
                return;
            }
            const activeSpan = getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
            if (activeSpan !== spanOnMount.current) {
                return;
            }
            cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
        },
        [],
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
                optionListItems={orderedReports}
            />
        </View>
    );
}

const WrappedSidebarLinksData = Sentry.withProfiler(SidebarLinksData);

export default WrappedSidebarLinksData;
