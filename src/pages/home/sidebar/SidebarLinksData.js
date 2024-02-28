import {deepEqual} from 'fast-equals';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import withCurrentReportID from '@components/withCurrentReportID';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withNavigationFocus from '@components/withNavigationFocus';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import {useOrderedReportListItems} from '@hooks/useOrderedReportListItems';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import {getPolicyMembersByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SidebarLinks, {basePropTypes} from './SidebarLinks';

const propTypes = {
    ...basePropTypes,

    /** Whether the reports are loading. When false it means they are ready to be used. */
    isLoadingApp: PropTypes.bool,

    /** The chat priority mode */
    priorityMode: PropTypes.string,

    network: networkPropTypes.isRequired,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    isLoadingApp: true,
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function SidebarLinksData({isFocused, currentReportID, insets, isLoadingApp, onLinkClick, priorityMode, network, policyMembers, currentUserPersonalDetails}) {
    const styles = useThemeStyles();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {translate} = useLocalize();
    const prevPriorityMode = usePrevious(priorityMode);

    const policyMemberAccountIDs = getPolicyMembersByIdWithoutCurrentUser(policyMembers, activeWorkspaceID, currentUserPersonalDetails.accountID);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => Policy.openWorkspace(activeWorkspaceID, policyMemberAccountIDs), [activeWorkspaceID]);

    const orderedReportListItemsRef = useRef(null);
    const isLoading = isLoadingApp;
    const orderedReportListItems = useOrderedReportListItems();

    const optionListItems = useMemo(() => {
        if (deepEqual(orderedReportListItemsRef.current, orderedReportListItems)) {
            return orderedReportListItemsRef.current;
        }

        // 1. We need to update existing reports only once while loading because they are updated several times during loading and causes this regression: https://github.com/Expensify/App/issues/24596#issuecomment-1681679531
        // 2. If the user is offline, we need to update the reports unconditionally, since the loading of report data might be stuck in this case.
        // 3. Changing priority mode to Most Recent will call OpenApp. If there is an existing reports and the priority mode is updated, we want to immediately update the list instead of waiting the OpenApp request to complete
        if (!isLoading || !orderedReportListItemsRef.current || network.isOffline || (orderedReportListItemsRef.current && prevPriorityMode !== priorityMode)) {
            orderedReportListItemsRef.current = orderedReportListItems;
        }
        return orderedReportListItemsRef.current || [];
    }, [orderedReportListItems, isLoading, network.isOffline, prevPriorityMode, priorityMode]);

    const currentReportIDRef = useRef(currentReportID);
    currentReportIDRef.current = currentReportID;
    const isActiveReport = useCallback((reportID) => currentReportIDRef.current === reportID, []);

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

SidebarLinksData.propTypes = propTypes;
SidebarLinksData.defaultProps = defaultProps;
SidebarLinksData.displayName = 'SidebarLinksData';

export default compose(
    withCurrentReportID,
    withCurrentUserPersonalDetails,
    withNavigationFocus,
    withNetwork(),
    withOnyx({
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
    }),
)(SidebarLinksData);
