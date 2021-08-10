import _ from 'underscore';
import React, {useEffect} from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import Icon from '../../components/Icon';
import {
    Users,
    ExpensifyCard,
    Workspace,
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

const propTypes = {
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

const WorkspaceSidebar = ({translate, isSmallScreenWidth, policy}) => {
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

    useEffect(() => {
        if (_.isEmpty(policy)) {
            Growl.error(translate('workspace.error.growlMessageInvalidPolicy'), CONST.GROWL.DURATION_LONG);
            Navigation.dismissModal();
            Navigation.navigate(ROUTES.WORKSPACE_NEW);
            return null;
        }
    }, [policy]);


    const openEditor = () => Navigation.navigate(ROUTES.getWorkspaceEditorRoute(policy.id));

    return (
        <ScreenWrapper>
            <ScrollView
                bounces={false}
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
                                            fill={themedefault.icon}
                                        />
                                    )}
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.alignSelfCenter,
                                    styles.mt4,
                                    styles.mb6,
                                ]}
                                onPress={openEditor}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.displayName,
                                    ]}
                                >
                                    {policy.name}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                    {menuItems.map(item => (
                        <MenuItem
                            key={item.translationKey}
                            title={translate(item.translationKey)}
                            icon={item.icon}
                            iconRight={item.iconRight}
                            onPress={() => item.action()}
                            wrapperStyle={!isSmallScreenWidth && item.isActive ? styles.activeComponentBG : undefined}
                            focused={item.isActive}
                            shouldShowRightIcon
                        />
                    ))}
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
