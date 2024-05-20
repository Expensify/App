import {useIsFocused} from '@react-navigation/native';
import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import useActiveWorkspaceFromNavigationState from '@hooks/useActiveWorkspaceFromNavigationState';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import type {PolicySelector} from '@hooks/useReportIDs';
import {policySelector, useReportIDs} from '@hooks/useReportIDs';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SidebarLinks from './SidebarLinks';

type SidebarLinksDataOnyxProps = {
    /** Whether the reports are loading. When false it means they are ready to be used. */
    isLoadingApp: OnyxEntry<boolean>;

    /** The chat priority mode */
    priorityMode: OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>;

    /** The policies which the user has access to */
    policies: OnyxCollection<PolicySelector>;
};

type SidebarLinksDataProps = SidebarLinksDataOnyxProps & {
    /** Toggles the navigation menu open and closed */
    onLinkClick: () => void;

    /** Safe area insets required for mobile devices margins */
    insets: EdgeInsets;
};

function SidebarLinksData({insets, isLoadingApp = true, onLinkClick, priorityMode = CONST.PRIORITY_MODE.DEFAULT, policies}: SidebarLinksDataProps) {
    const {accountID} = useCurrentUserPersonalDetails();
    const isFocused = useIsFocused();
    const styles = useThemeStyles();
    const activeWorkspaceID = useActiveWorkspaceFromNavigationState();
    const {translate} = useLocalize();

    const policyMemberAccountIDs = getPolicyEmployeeListByIdWithoutCurrentUser(policies, activeWorkspaceID, accountID);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => Policy.openWorkspace(activeWorkspaceID ?? '', policyMemberAccountIDs), [activeWorkspaceID]);

    const isLoading = isLoadingApp;
    const {orderedReportIDs, currentReportID} = useReportIDs();

    const currentReportIDRef = useRef(currentReportID);
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
                onLinkClick={onLinkClick}
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

export default withOnyx<SidebarLinksDataProps, SidebarLinksDataOnyxProps>({
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
    priorityMode: {
        key: ONYXKEYS.NVP_PRIORITY_MODE,
        initialValue: CONST.PRIORITY_MODE.DEFAULT,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
        selector: policySelector,
        initialValue: {},
    },
})(
    /* 
While working on audit on the App Start App metric we noticed that by memoizing SidebarLinksData we can avoid 2 additional run of getOrderedReportIDs.
With that we can reduce app start up time by ~2s on heavy account.
More details - https://github.com/Expensify/App/issues/35234#issuecomment-1926914534
*/
    memo(
        SidebarLinksData,
        (prevProps, nextProps) =>
            prevProps.isLoadingApp === nextProps.isLoadingApp &&
            prevProps.priorityMode === nextProps.priorityMode &&
            lodashIsEqual(prevProps.insets, nextProps.insets) &&
            prevProps.onLinkClick === nextProps.onLinkClick &&
            lodashIsEqual(prevProps.policies, nextProps.policies),
    ),
);
