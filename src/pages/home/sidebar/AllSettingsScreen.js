import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Breadcrumbs from '@components/Breadcrumbs';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import useActiveRoute from '@hooks/useActiveRoute';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function AllSettingsScreen() {
    const styles = useThemeStyles();
    const {isExecuting, singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
    const {translate} = useLocalize();
    const activeRoute = useActiveRoute();
    /**
     * Retuns a list of menu items data for "everything" settings
     * @returns {Object} object with translationKey, style and items
     */
    const menuItemsData = useMemo(
        () => ({
            sectionStyle: styles.accountSettingsSectionContainer,
            sectionTranslationKey: 'initialSettingsPage.account',
            items: [
                {
                    translationKey: 'common.workspaces',
                    icon: Expensicons.Building,
                    routeName: ROUTES.SETTINGS_WORKSPACES,
                },
                {
                    translationKey: 'allSettingsScreen.subscriptions',
                    icon: Expensicons.MoneyBag,
                    action: () => {
                        Link.openOldDotLink(CONST.ADMIN_POLICIES_URL);
                    },
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    link: CONST.ADMIN_POLICIES_URL,
                },
                {
                    translationKey: 'allSettingsScreen.cardsAndDomains',
                    icon: Expensicons.CardsAndDomains,
                    action: () => {
                        Link.openOldDotLink(CONST.ADMIN_DOMAINS_URL);
                    },
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    link: CONST.ADMIN_DOMAINS_URL,
                },
            ],
        }),
        [styles.accountSettingsSectionContainer],
    );

    /**
     * Retuns JSX.Element with menu items
     * @param {Object} data list with menu items data
     * @returns {JSX.Element} the menu items for passed data
     */
    const getMenuItemsSection = useCallback(
        (data) => (
            <View style={[styles.pb4, styles.mh3]}>
                {_.map(data.items, (item, index) => {
                    const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;

                    return (
                        <MenuItem
                            key={`${keyTitle}_${index}`}
                            wrapperStyle={styles.sectionMenuItem}
                            title={keyTitle}
                            icon={item.icon}
                            shouldShowRightIcon={item.shouldShowRightIcon}
                            iconRight={item.iconRight}
                            disabled={isExecuting}
                            onPress={singleExecution(() => {
                                if (item.action) {
                                    item.action();
                                } else {
                                    waitForNavigate(() => {
                                        Navigation.navigate(item.routeName);
                                    })();
                                }
                            })}
                            shouldBlockSelection={Boolean(item.link)}
                            focused={activeRoute && activeRoute.startsWith(item.routeName)}
                            isPaneMenu
                        />
                    );
                })}
            </View>
        ),
        [activeRoute, isExecuting, singleExecution, styles.mh3, styles.pb4, styles.sectionMenuItem, translate, waitForNavigate],
    );

    const accountMenuItems = useMemo(() => getMenuItemsSection(menuItemsData), [menuItemsData, getMenuItemsSection]);

    return (
        <>
            <Breadcrumbs
                breadcrumbs={[
                    {
                        type: CONST.BREADCRUMB_TYPE.ROOT,
                    },
                    {
                        text: translate('common.settings'),
                    },
                ]}
                style={[styles.pb5, styles.ph5]}
            />
            {accountMenuItems}
        </>
    );
}

AllSettingsScreen.displayName = 'AllSettingsScreen';

export default AllSettingsScreen;
