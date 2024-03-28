import PropTypes from 'prop-types';
import React, {memo, useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withNavigationFocus from '@components/withNavigationFocus';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import {useReportIDs} from '@hooks/useReportIDs';
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

    // eslint-disable-next-line react/forbid-prop-types
    policyMembers: PropTypes.object,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    isLoadingApp: true,
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    policyMembers: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function SidebarLinksData({isFocused, insets, isLoadingApp, onLinkClick, priorityMode, policyMembers, currentUserPersonalDetails}) {
    const styles = useThemeStyles();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {translate} = useLocalize();

    const policyMemberAccountIDs = getPolicyMembersByIdWithoutCurrentUser(policyMembers, activeWorkspaceID, currentUserPersonalDetails.accountID);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => Policy.openWorkspace(activeWorkspaceID, policyMemberAccountIDs), [activeWorkspaceID]);

    const isLoading = isLoadingApp;
    const {orderedReportIDs, currentReportID} = useReportIDs();

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
                optionListItems={orderedReportIDs}
            />
        </View>
    );
}

SidebarLinksData.propTypes = propTypes;
SidebarLinksData.defaultProps = defaultProps;
SidebarLinksData.displayName = 'SidebarLinksData';

export default compose(
    withCurrentUserPersonalDetails,
    withNavigationFocus,
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
)(
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
            _.isEqual(prevProps.insets, nextProps.insets) &&
            prevProps.onLinkClick === nextProps.onLinkClick &&
            _.isEqual(prevProps.policyMembers, nextProps.policyMembers) &&
            _.isEqual(prevProps.currentUserPersonalDetails, nextProps.currentUserPersonalDetails),
    ),
);
