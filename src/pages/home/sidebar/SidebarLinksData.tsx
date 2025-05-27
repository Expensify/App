import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import {useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAssignedSupportData, openWorkspace} from '@libs/actions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SidebarLinks from './SidebarLinks';

function SidebarLinksDataInternal() {
    const {activeWorkspaceID} = useActiveWorkspace();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true, canBeMissing: true});
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {initialValue: CONST.PRIORITY_MODE.DEFAULT, canBeMissing: true});

    const {orderedReports, currentReportID, policyMemberAccountIDs} = useSidebarOrderedReports();

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
        <SidebarLinks
            // Forwarded props:
            priorityMode={priorityMode ?? CONST.PRIORITY_MODE.DEFAULT}
            // Data props:
            isActiveReport={isActiveReport}
            isLoading={isLoadingApp ?? false}
            activeWorkspaceID={activeWorkspaceID}
            optionListItems={orderedReports}
        />
    );
}

function SidebarLinksData({children}: React.PropsWithChildren<unknown>) {
    const isFocused = useIsFocused();
    const styles = useThemeStyles();

    const {translate} = useLocalize();

    return (
        <View
            accessibilityElementsHidden={!isFocused}
            collapsable={false}
            accessibilityLabel={translate('sidebarScreen.listOfChats')}
            style={[styles.flex1, styles.h100]}
        >
            {children}
        </View>
    );
}

SidebarLinksData.displayName = 'SidebarLinksData';

export default SidebarLinksData;

export {SidebarLinksDataInternal};
