import React from 'react';
import {View, ScrollView} from 'react-native';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import {
    Wallet,
    Users,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import Logo from '../../../assets/images/expensify-cash.svg';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceSidebar = ({translate}) => {
    const menuItems = [
        {
            translationKey: 'workspace.common.card',
            icon: Wallet,
            action: () => {
                Navigation.navigate(ROUTES.WORKSPACE_CARD);
            },
        },
        {
            translationKey: 'common.people',
            icon: Users,
            action: () => {
                Navigation.navigate(ROUTES.WORKSPACE_CARD);
            },
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
                    <View style={styles.pageWrapper}>
                        <View style={[styles.settingsPageBody, styles.mb6]}>
                            <Logo height={100} />
                            <Text
                                style={[
                                    styles.textLarge,
                                    styles.alignSelfCenter,
                                    styles.mv2,
                                ]}
                            >
                                Borton Enterprises
                            </Text>
                        </View>
                    </View>
                    {menuItems.map(item => (
                        <MenuItem
                            key={item.title}
                            title={translate(item.translationKey)}
                            icon={item.icon}
                            iconRight={item.iconRight}
                            onPress={() => item.action()}
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

export default withLocalize(WorkspaceSidebar);
