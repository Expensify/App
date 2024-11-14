import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import useActiveWorkspaceFromNavigationState from '@hooks/useActiveWorkspaceFromNavigationState';
import useLocalize from '@hooks/useLocalize';
import {useReportIDs} from '@hooks/useReportIDs';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Policy from '@userActions/Policy/Policy';
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
    const activeWorkspaceID = useActiveWorkspaceFromNavigationState();
    const {translate} = useLocalize();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {initialValue: CONST.PRIORITY_MODE.DEFAULT});

    const {orderedReportIDs, currentReportID, policyMemberAccountIDs} = useReportIDs();

    useEffect(() => {
        if (!activeWorkspaceID) {
            return;
        }

        Policy.openWorkspace(activeWorkspaceID, policyMemberAccountIDs);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [activeWorkspaceID]);

    const isLoading = isLoadingApp;
    const currentReportIDRef = useRef(currentReportID);
    // eslint-disable-next-line react-compiler/react-compiler
    currentReportIDRef.current = currentReportID;
    const isActiveReport = useCallback((reportID: string): boolean => currentReportIDRef.current === reportID, []);

    return (
        <View
            accessibilityElementsHidden={!isFocused}
            collapsable={false}
            accessibilityLabel={translate('sidebarScreen.listOfChats')}
            style={[styles.flex1, styles.h100]}
        >
            <SidebarLinks
                // Forwarded props:
                insets={insets}
                priorityMode={priorityMode ?? CONST.PRIORITY_MODE.DEFAULT}
                // Data props:
                isActiveReport={isActiveReport}
                isLoading={isLoading ?? false}
                activeWorkspaceID={activeWorkspaceID}
                optionListItems={orderedReportIDs}
            />
        </View>
    );
}

SidebarLinksData.displayName = 'SidebarLinksData';

export default SidebarLinksData;
