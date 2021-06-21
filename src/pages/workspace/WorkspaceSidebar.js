import React from 'react';
import {View, ScrollView} from 'react-native';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import {
    Wallet,
    Users,
    Pencil,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import WorkspaceDefaultAvatar from '../../../assets/images/workspace-default-avatar.svg';
import variables from '../../styles/variables';
import themedefault from '../../styles/themes/default';
import Icon from '../../components/Icon';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const WorkspaceSidebar = ({translate, isSmallWidthScreen}) => {
    const menuItems = [
        {
            translationKey: 'workspace.common.card',
            icon: Wallet,
            action: () => {
                Navigation.navigate(ROUTES.WORKSPACE_CARD);
            },
            isActive: Navigation.isActive(ROUTES.WORKSPACE_CARD),
        },
        {
            translationKey: 'common.people',
            icon: Users,
            action: () => {},
            isActive: false,
        },
    ];

    return (
        <ScreenWrapper style={[styles.sidebar]}>
            <ScrollView
                bounces={false}
                contentContainerStyle={[
                    styles.flexGrow1,
                    styles.flexColumn,
                    styles.justifyContentBetween,
                ]}
            >
                <View style={[styles.flex1]}>
                    {isSmallWidthScreen
                        && (
                            <HeaderWithCloseButton
                                title={translate('workspace.common.workspace')}
                                shouldShowBackButton
                            />
                        )}
                    <View style={styles.pageWrapper}>
                        <View style={[styles.settingsPageBody, styles.alignItemsCenter, styles.pv5]}>
                            <View style={[styles.pRelative, styles.workspaceSidebarAvatar]}>
                                <WorkspaceDefaultAvatar height={100} width={100} fill={themedefault.icon} />
                                <View style={[
                                    styles.workspaceSidebarAvatarPencil,
                                    styles.alignItemsCenter,
                                    styles.justifyContentCenter,
                                ]}
                                >
                                    <Icon
                                        src={Pencil}
                                        fill={themedefault.textReversed}
                                    />
                                </View>
                            </View>
                            <Text
                                fontSize={variables.fontSizeXLarge}
                                style={[
                                    styles.textStrong,
                                    styles.alignSelfCenter,
                                    styles.mv4,
                                ]}
                            >
                                Borton Enterprises
                            </Text>
                        </View>
                    </View>
                    {menuItems.map(item => (
                        <MenuItem
                            key={item.translationKey}
                            title={translate(item.translationKey)}
                            icon={item.icon}
                            iconRight={item.iconRight}
                            onPress={() => item.action()}
                            wrapperStyle={!isSmallWidthScreen && item.isActive ? styles.activeComponentBG : undefined}
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
WorkspaceSidebar.displayName = 'WorkspaceSidebar';

export default compose(
    withLocalize,
    withWindowDimensions,
)(WorkspaceSidebar);
