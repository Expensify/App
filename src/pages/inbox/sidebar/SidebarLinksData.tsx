import useInboxTabSpanLifecycle from '@hooks/useInboxTabSpanLifecycle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {EdgeInsets} from 'react-native-safe-area-context';

import {useIsFocused} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';

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

    const {filteredReports, orderedReportIDs, currentReportID} = useSidebarOrderedReportsState();

    const currentReportIDRef = useRef(currentReportID);
    currentReportIDRef.current = currentReportID;
    const isActiveReport = useCallback((reportID: string): boolean => currentReportIDRef.current === reportID, []);

    const onLayout = useInboxTabSpanLifecycle();

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
                optionListItems={filteredReports}
                hasReportData={orderedReportIDs.length > 0}
            />
        </View>
    );
}

const WrappedSidebarLinksData = Sentry.withProfiler(SidebarLinksData);

export default WrappedSidebarLinksData;
