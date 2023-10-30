import PropTypes from 'prop-types';
import React, {useContext, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import SidebarLinksData from '@pages/home/sidebar/SidebarLinksData';
import {SidebarNavigationContext} from '@pages/home/sidebar/SidebarNavigationContext';
import safeAreaInsetPropTypes from '@pages/safeAreaInsetPropTypes';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import HeaderWithBreadcrumbs from './HeaderWithBreadcrumbs';
import SubNavigationMenu from './SubNavigationMenu';

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
                                Navigation.navigate(ROUTES.INDIVIDUAL_OLDDOT);
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
            <View style={[StyleSheet.absoluteFillObject, StyleUtils.displayIfTrue(sidebarNavigation.selectedSubNavigationMenu === CONST.SUB_NAVIGATION_MENU.WORKSPACE_NESTED)]}>
                <SubNavigationMenu
                    title={translate('globalNavigation.money')}
                    customHeader={
                        <HeaderWithBreadcrumbs
                            title="Shawn's Workspace"
                            breadcrumbs={['Workspaces', 'Groups']}
                            onPress={() => {
                                // TODO: decide where to go
                                // navigation.navigate('somwhere')
                            }}
                        />
                    }
                    menuItems={[
                        {
                            icon: Expensicons.Home,
                            text: translate('subNavigation.overview'),
                            value: SCREENS.WORKSPACE_OVERVIEW_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACES_OVERVIEW_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Receipt,
                            text: translate('subNavigation.expenses'),
                            value: SCREENS.WORKSPACE_EXPENSES_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_EXPENSES_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Document,
                            text: translate('subNavigation.reports'),
                            value: SCREENS.WORKSPACE_REPORTS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_REPORTS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Link,
                            text: translate('subNavigation.connections'),
                            value: SCREENS.WORKSPACE_CONNECTIONS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_CONNECTIONS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Folder,
                            text: translate('subNavigation.categories'),
                            value: SCREENS.WORKSPACE_CATEGORIES_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Tag,
                            text: translate('subNavigation.tags'),
                            value: SCREENS.WORKSPACE_TAGS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_TAGS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Coins,
                            text: translate('subNavigation.tax'),
                            value: SCREENS.WORKSPACE_TAX_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_TAX_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Users,
                            text: translate('workspace.common.members'),
                            value: SCREENS.WORKSPACE_MEMBERS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_MEMBERS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Bank,
                            text: translate('workspace.common.reimburse'),
                            value: SCREENS.WORKSPACE_REIMBURSEMENT_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSKPACE_REIMBURSEMENT_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Plane,
                            text: translate('workspace.common.travel'),
                            value: SCREENS.WORKSPACE_TRAVEL_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Calendar,
                            text: translate('subNavigation.perDiem'),
                            value: SCREENS.WORKSPACE_PER_DIEM_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Table,
                            text: translate('subNavigation.exportFormats'),
                            value: SCREENS.WORKSPACE_EXPORT_FORMATS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_EXPORT_FORMATS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Bill,
                            text: translate('workspace.common.invoices'),
                            value: SCREENS.WORKSPACE_INVOICES_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_INVOICES_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Briefcase,
                            text: translate('subNavigation.plan'),
                            value: SCREENS.WORKSPACE_PLAN_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.WORKSPACE_PLAN_OLDDOT);
                            },
                        },
                    ]}
                />
            </View>
            <View style={[StyleSheet.absoluteFillObject, StyleUtils.displayIfTrue(sidebarNavigation.selectedSubNavigationMenu === CONST.SUB_NAVIGATION_MENU.DOMAIN_NESTED)]}>
                <SubNavigationMenu
                    title={translate('globalNavigation.money')}
                    customHeader={
                        <HeaderWithBreadcrumbs
                            title="Expensify.com"
                            breadcrumbs={['Domains']}
                            onPress={() => {
                                // TODO: decide where to go
                                // navigation.navigate('somwhere')
                            }}
                        />
                    }
                    menuItems={[
                        {
                            icon: Expensicons.CreditCard,
                            text: translate('subNavigation.companyCards'),
                            value: SCREENS.DOMAIN_COMPANY_CARDS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.DOMAIN_COMPANY_CARDS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Shield,
                            text: translate('subNavigation.domainAdmins'),
                            value: SCREENS.DOMAIN_ADMINS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.DOMAIN_ADMINS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.User,
                            text: translate('subNavigation.domainMembers'),
                            value: SCREENS.DOMAIN_MEMBERS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.DOMAIN_MEMBERS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Users,
                            text: translate('subNavigation.groups'),
                            value: SCREENS.DOMAIN_GROUPS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.DOMAIN_GROUPS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.DocumentGear,
                            text: translate('subNavigation.reportingTools'),
                            value: SCREENS.DOMAIN_REPORTING_TOOLS_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.DOMAIN_REPORTING_TOOLS_OLDDOT);
                            },
                        },
                        {
                            icon: Expensicons.Lock,
                            text: translate('subNavigation.SAML'),
                            value: SCREENS.DOMAIN_SAML_OLDDOT,
                            onSelected: () => {
                                Navigation.navigate(ROUTES.DOMAIN_SAML_OLDDOT);
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
