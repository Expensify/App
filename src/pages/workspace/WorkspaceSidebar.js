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
    Plus,
    Trashcan,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import themedefault from '../../styles/themes/default';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Avatar from '../../components/Avatar';
import Tooltip from '../../components/Tooltip';
import variables from '../../styles/variables';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import {create} from '../../libs/actions/Policy';

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

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    policy: {},
};

const WorkspaceSidebar = ({
    translate, isSmallScreenWidth, policy, isFocused,
}) => {
    if (_.isEmpty(policy)) {
        return <FullScreenLoadingIndicator />;
    }

    const menuItems = [
        {
            translationKey: 'workspace.common.card',
            icon: ExpensifyCard,
            action: () => {
                Navigation.navigate(ROUTES.getWorkspaceCardRoute(policy.id));
            },
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceCardRoute(policy.id)),
        },
        {
            translationKey: 'common.people',
            icon: Users,
            action: () => {
                Navigation.navigate(ROUTES.getWorkspacePeopleRoute(policy.id));
            },
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspacePeopleRoute(policy.id)),
        },
    ];

    const openEditor = () => Navigation.navigate(ROUTES.getWorkspaceEditorRoute(policy.id));

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

                    <HeaderWithCloseButton
                        title={translate('workspace.common.workspace')}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                        shouldShowCloseButton={isSmallScreenWidth}
                        shouldShowThreeDotsButton
                        threeDotsMenuItems={[
                            {
                                icon: Plus,
                                text: translate('workspace.new.newWorkspace'),
                                onPress: create(),
                            }, {
                                icon: Trashcan,
                                text: translate('workspace.common.delete'),
                            },
                        ]}
                    />

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
            key: (props) => {
                const routes = lodashGet(props.navigation.getState(), 'routes', []);
                const routeWithPolicyIDParam = _.find(routes, route => route.params && route.params.policyID);
                const policyID = lodashGet(routeWithPolicyIDParam, ['params', 'policyID']);
                return `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
            },
        },
    }),
)(WorkspaceSidebar);
