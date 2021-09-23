import _ from 'underscore';
import React from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withNavigationFocus} from '@react-navigation/compat';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import Icon from '../../components/Icon';
import {
    Users,
    ExpensifyCard,
    Workspace,
    Pencil,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import themedefault from '../../styles/themes/default';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import Growl from '../../libs/Growl';
import ONYXKEYS from '../../ONYXKEYS';
import Avatar from '../../components/Avatar';
import CONST from '../../CONST';
import Tooltip from '../../components/Tooltip';
import variables from '../../styles/variables';

const propTypes = {
    /** Whether the current screen is focused. */
    isFocused: PropTypes.bool.isRequired,

    /** Policy for the current route */
    policy: PropTypes.shape({
        /** ID of the policy */
        id: PropTypes.string,

        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** All the polices that we have loaded in Onyx */
    allPolicies: PropTypes.shape({
        /** ID of the policy */
        id: PropTypes.string,
    }),

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    policy: {},
    allPolicies: null,
};

/**
 * @param {Object} navigationState
 * @returns {String|undefined}
 */
function getPolicyIDFromNavigationState(navigationState) {
    const routes = lodashGet(navigationState, 'routes', []);
    const routeWithPolicyIDParam = _.find(routes, route => route.params && route.params.policyID);
    return lodashGet(routeWithPolicyIDParam, ['params', 'policyID']);
}

const WorkspaceSidebar = ({
    translate, isSmallScreenWidth, policy, allPolicies, isFocused, navigation,
}) => {
    const policyID = lodashGet(policy, 'id');
    const menuItems = [
        {
            translationKey: 'workspace.common.card',
            icon: ExpensifyCard,
            action: () => {
                if (policyID) {
                    Navigation.navigate(ROUTES.getWorkspaceCardRoute(policyID));
                }
            },
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceCardRoute(policyID)),
        },
        {
            translationKey: 'common.people',
            icon: Users,
            action: () => {
                if (policyID) {
                    Navigation.navigate(ROUTES.getWorkspacePeopleRoute(policyID));
                }
            },
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspacePeopleRoute(policyID)),
        },
    ];

    /* After all the policies have loaded, check if the given policyID points to a nonexistant workspace.
     *
     * Check the route parameter, because we can't tell the difference between a default value for policy not yet loaded
     * and the scenario where the policy isn't found in Onyx.
     *
     * When free plan is out of beta and Permissions.canUseFreePlan() gets removed,
     * all code involving 'allPolicies' can be removed since policy loading will no longer be delayed on login.
     */
    const policyIDFromRoute = getPolicyIDFromNavigationState(navigation.getState());
    if (allPolicies && !_.any(allPolicies, loadedPolicy => loadedPolicy.id === policyIDFromRoute)) {
        Growl.error(translate('workspace.error.growlMessageInvalidPolicy'), CONST.GROWL.DURATION_LONG);
        Navigation.dismissModal();
        return null;
    }


    const openEditor = () => {
        if (policyID) {
            Navigation.navigate(ROUTES.getWorkspaceEditorRoute(policyID));
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView
                contentContainerStyle={[
                    styles.flexGrow1,
                    styles.flexColumn,
                    styles.justifyContentBetween,
                ]}
            >
                <View style={[styles.flex1]}>
                    {isSmallScreenWidth
                        && (
                            <HeaderWithCloseButton
                                title={translate('workspace.common.workspace')}
                                onCloseButtonPress={() => Navigation.dismissModal()}
                            />
                        )}
                    <View style={styles.pageWrapper}>
                        <View style={[styles.settingsPageBody, styles.alignItemsCenter]}>
                            <Pressable
                                style={[styles.pRelative, styles.avatarLarge]}
                                onPress={openEditor}
                            >
                                {policy.avatarURL
                                    ? (
                                        <Avatar
                                            containerStyles={styles.avatarLarge}
                                            imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                            source={policy.avatarURL}
                                        />
                                    )
                                    : (
                                        <Icon
                                            src={Workspace}
                                            height={80}
                                            width={80}
                                            fill={themedefault.iconSuccessFill}
                                        />
                                    )}
                                <Tooltip absolute text={translate('workspace.common.edit')}>
                                    <View style={[styles.smallEditIcon, styles.smallAvatarEditIcon]}>
                                        <Icon
                                            src={Pencil}
                                            width={variables.iconSizeSmall}
                                            height={variables.iconSizeSmall}
                                            fill={themedefault.iconReversed}
                                        />
                                    </View>
                                </Tooltip>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.alignSelfCenter,
                                    styles.mt4,
                                    styles.mb6,
                                    styles.w100,
                                ]}
                                onPress={openEditor}
                            >
                                {policy.name && (
                                    <Tooltip text={policy.name}>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.displayName,
                                                styles.alignSelfCenter,
                                            ]}
                                        >
                                            {policy.name}
                                        </Text>
                                    </Tooltip>
                                )}
                            </Pressable>
                        </View>
                    </View>
                    {menuItems.map((item) => {
                        const shouldFocus = isSmallScreenWidth ? !isFocused && item.isActive : item.isActive;
                        return (
                            <MenuItem
                                key={item.translationKey}
                                title={translate(item.translationKey)}
                                icon={item.icon}
                                iconRight={item.iconRight}
                                onPress={() => item.action()}
                                wrapperStyle={shouldFocus ? styles.activeComponentBG : undefined}
                                focused={shouldFocus}
                                shouldShowRightIcon
                            />
                        );
                    })}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

WorkspaceSidebar.propTypes = propTypes;
WorkspaceSidebar.defaultProps = defaultProps;
WorkspaceSidebar.displayName = 'WorkspaceSidebar';

export default compose(
    withLocalize,
    withWindowDimensions,
    withNavigationFocus,
    withOnyx({
        policy: {
            key: props => `${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDFromNavigationState(props.navigation.getState())}`,
        },
        allPolicies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(WorkspaceSidebar);
