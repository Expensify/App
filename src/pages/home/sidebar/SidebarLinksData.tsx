import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import {useSidebarOrderedReportIDs} from '@hooks/useSidebarOrderedReportIDs';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAssignedSupportData, openWorkspace} from '@libs/actions/Policy/Policy';
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
    const {activeWorkspaceID} = useActiveWorkspace();
    const {translate} = useLocalize();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {initialValue: CONST.PRIORITY_MODE.DEFAULT});

    const {orderedReportIDs, currentReportID, policyMemberAccountIDs} = useSidebarOrderedReportIDs();

    const previousActiveWorkspaceID = usePrevious(activeWorkspaceID);

    useEffect(() => {
        if (!activeWorkspaceID || previousActiveWorkspaceID === activeWorkspaceID) {
            return;
        }

        openWorkspace(activeWorkspaceID, policyMemberAccountIDs);
        getAssignedSupportData(activeWorkspaceID);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [activeWorkspaceID]);

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
                isLoading={isLoadingApp ?? false}
                activeWorkspaceID={activeWorkspaceID}
                optionListItems={orderedReportIDs}
            />
        </View>
    );
}

SidebarLinksData.displayName = 'SidebarLinksData';

export default SidebarLinksData;
