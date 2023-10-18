import PropTypes from 'prop-types';
import React, {useContext, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import styles from '../../../../styles/styles';
import SidebarLinksData from '../SidebarLinksData';
import Timing from '../../../../libs/actions/Timing';
import CONST from '../../../../CONST';
import Performance from '../../../../libs/Performance';
import safeAreaInsetPropTypes from '../../../safeAreaInsetPropTypes';
import SubNavigationMenu from './SubNavigationMenu';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import ROUTES from '../../../../ROUTES';
import Navigation from '../../../../libs/Navigation/Navigation';
import SCREENS from '../../../../SCREENS';
import {SidebarNavigationContext} from '../SidebarNavigationContext';
import * as StyleUtils from '../../../../styles/StyleUtils';
import useLocalize from '../../../../hooks/useLocalize';
import HeaderWithBreadcrumbs from './HeaderWithBreadcrumbs';

const propTypes = {
    /** Function called when a pinned chat is selected. */
    onLinkClick: PropTypes.func.isRequired,

    /** Insets for SidebarLInksData */
    insets: safeAreaInsetPropTypes.isRequired,
};

function SubNavigation({onLinkClick, insets}) {
    const sidebarNavigation = useContext(SidebarNavigationContext);
    const {translate} = useLocalize();

    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);
    }, []);

    return (
        <View style={styles.subNavigationContainer}>
            <View style={[StyleSheet.absoluteFillObject, StyleUtils.displayIfTrue(sidebarNavigation.selectedSubNavigationMenu === CONST.SUB_NAVIGATION_MENU.CHATS)]}>
                <SidebarLinksData
                    insets={insets}
                    onLinkClick={onLinkClick}
                />
            </View>
            <View style={[StyleSheet.absoluteFillObject, StyleUtils.displayIfTrue(sidebarNavigation.selectedSubNavigationMenu === CONST.SUB_NAVIGATION_MENU.MONEY)]}>
                <SubNavigationMenu
                    title={translate('globalNavigation.money')}
                    menuItems={[
                        {
                            icon: Expensicons.Receipt,
                            text: translate('subNavigation.expenses'),
                            value: SCREENS.EXPENSES_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.EXPENSES_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Document,
                            text: translate('subNavigation.reports'),
                            value: SCREENS.REPORTS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.REPORTS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Lightbulb,
                            text: translate('subNavigation.insights'),
                            value: SCREENS.INSIGHTS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.INSIGHTS_OLDDOT);
                            },
                        },
                    ]}
                />
            </View>
            <View style={[StyleSheet.absoluteFillObject, StyleUtils.displayIfTrue(sidebarNavigation.selectedSubNavigationMenu === CONST.SUB_NAVIGATION_MENU.WORKSPACES)]}>
                <SubNavigationMenu
                    title={translate('workspace.common.workspace')}
                    menuItems={[
                        {
                            icon: Expensicons.User,
                            text: translate('subNavigation.individual'),
                            value: SCREENS.INDIVIDUAL_WORKSPACE_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.INDIVIDUALS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Building,
                            text: translate('subNavigation.groups'),
                            value: SCREENS.GROUPS_WORKSPACES_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.GROUPS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.CardsDomains,
                            text: translate('subNavigation.cardsAndDomains'),
                            value: SCREENS.DOMAINS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.DOMAINS_OLDDOT);
                            },
                        },
                    ]}
                />
            </View>
            <View style={[StyleSheet.absoluteFillObject, StyleUtils.displayIfTrue(sidebarNavigation.selectedSubNavigationMenu === CONST.SUB_NAVIGATION_MENU.DOMAINS)]}>
                <SubNavigationMenu
                    title={translate('globalNavigation.money')}
                    customHeader={
                        <HeaderWithBreadcrumbs
                            title="Expensify.com"
                            breadcrumbs={['Workspaces', 'Groups']}
                            onPress={() => {
                                // TODO: decide where to go
                                // navigation.navigate('somwhere')
                            }}
                        />
                    }
                    menuItems={[
                        {
                            icon: Expensicons.Receipt,
                            text: 'tmp1',
                            value: SCREENS.DOMAIN_OLDDOT_TEST,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.EXPENSES_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Document,
                            text: 'tmp2',
                            value: SCREENS.REPORTS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.REPORTS_OLDDOT);
                            },
                        },
                    ]}
                />
            </View>
        </View>
    );
}

SubNavigation.propTypes = propTypes;
SubNavigation.displayName = 'SubNavigation';

export default SubNavigation;
