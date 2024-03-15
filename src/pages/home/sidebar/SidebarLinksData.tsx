import {useIsFocused} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import type {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import withCurrentReportID from '@components/withCurrentReportID';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import {useReportIDs} from '@hooks/useReportIDs';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPolicyMembersByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import SidebarLinks from './SidebarLinks';

type PolicySelector = Pick<OnyxTypes.Policy, 'type' | 'name' | 'avatar'>;

type SidebarLinksDataOnyxProps = {
    /** Wheather the reports are loading. When false it means they are ready to be used. */
    isLoadingApp: OnyxEntry<boolean>;

    /** The chat priority mode */
    priorityMode: OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>;

    /** All policy members */
    policyMembers: OnyxCollection<OnyxTypes.PolicyMembers>;
};

type SidebarLinksDataProps = CurrentReportIDContextValue &
    SidebarLinksDataOnyxProps & {
        /** Toggles the navigation menu open and closed */
        onLinkClick: () => void;

        /** Safe area insets required for mobile devices margins */
        insets: EdgeInsets;
    };

function SidebarLinksData({insets, isLoadingApp = true, onLinkClick, priorityMode = CONST.PRIORITY_MODE.DEFAULT, policyMembers, currentReportID}: SidebarLinksDataProps) {
    const {accountID} = useCurrentUserPersonalDetails();
    const network = useNetwork();
    const isFocused = useIsFocused();
    const styles = useThemeStyles();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {translate} = useLocalize();
    const prevPriorityMode = usePrevious(priorityMode);
    const policyMemberAccountIDs = getPolicyMembersByIdWithoutCurrentUser(policyMembers, activeWorkspaceID, accountID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => Policy.openWorkspace(activeWorkspaceID ?? '', policyMemberAccountIDs), [activeWorkspaceID]);

    const orderedReportIDsRef = useRef<string[] | null>(null);
    const isLoading = isLoadingApp;
    const {orderedReportIDs} = useReportIDs();

    const optionListItems = useMemo(() => {
        if (deepEqual(orderedReportIDsRef.current, orderedReportIDs)) {
            return orderedReportIDsRef.current ?? [];
        }

        // 1. We need to update existing reports only once while loading because they are updated several times during loading and causes this regression: https://github.com/Expensify/App/issues/24596#issuecomment-1681679531
        // 2. If the user is offline, we need to update the reports unconditionally, since the loading of report data might be stuck in this case.
        // 3. Changing priority mode to Most Recent will call OpenApp. If there is an existing reports and the priority mode is updated, we want to immediately update the list instead of waiting the OpenApp request to complete
        if (!isLoading || !orderedReportIDsRef.current || network.isOffline || (orderedReportIDsRef.current && prevPriorityMode !== priorityMode)) {
            orderedReportIDsRef.current = orderedReportIDs;
        }
        return orderedReportIDsRef.current || [];
    }, [orderedReportIDs, isLoading, network.isOffline, prevPriorityMode, priorityMode]);

    const currentReportIDRef = useRef(currentReportID);
    currentReportIDRef.current = currentReportID;
    const isActiveReport = useCallback((reportID: string): boolean => currentReportIDRef.current === reportID, []);

    return (
        <View
            accessibilityElementsHidden={!isFocused}
            accessibilityLabel={translate('sidebarScreen.listOfChats')}
            style={[styles.flex1, styles.h100]}
        >
            <SidebarLinks
                // Forwarded props:
                onLinkClick={onLinkClick}
                insets={insets}
                priorityMode={priorityMode}
                // Data props:
                isActiveReport={isActiveReport}
                isLoading={isLoading}
                activeWorkspaceID={activeWorkspaceID}
                optionListItems={optionListItems}
            />
        </View>
    );
}

SidebarLinksData.displayName = 'SidebarLinksData';

export default withCurrentReportID(
    withOnyx<SidebarLinksDataProps, SidebarLinksDataOnyxProps>({
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
            initialValue: CONST.PRIORITY_MODE.DEFAULT,
        },
        policyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
        },
    })(SidebarLinksData),
);

export type {PolicySelector};
