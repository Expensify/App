import React, {useMemo} from 'react';
import {ScrollView} from 'react-native';
import _ from 'underscore';
import Breadcrumbs from '@components/Breadcrumbs';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function AllSettingsScreen() {
    const styles = useThemeStyles();
    const waitForNavigate = useWaitForNavigation();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    /**
     * Retuns a list of menu items data for "everything" settings
     * @returns {Object} object with translationKey, style and items
     */
    const menuItems = useMemo(() => {
        const baseMenuItems = [
            {
                translationKey: 'common.workspaces',
                icon: Expensicons.Building,
                action: () => {
                    waitForNavigate(() => {
                        Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
                    })();
                },
                focused: !isSmallScreenWidth,
            },
            {
                translationKey: 'allSettingsScreen.subscriptions',
                icon: Expensicons.MoneyBag,
                action: () => {
                    Link.openOldDotLink(CONST.OLDDOT_URLS.ADMIN_POLICIES_URL);
                },
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
                link: CONST.OLDDOT_URLS.ADMIN_POLICIES_URL,
            },
            {
                translationKey: 'allSettingsScreen.cardsAndDomains',
                icon: Expensicons.CardsAndDomains,
                action: () => {
                    Link.openOldDotLink(CONST.OLDDOT_URLS.ADMIN_DOMAINS_URL);
                },
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
                link: CONST.OLDDOT_URLS.ADMIN_DOMAINS_URL,
            },
        ];
        return _.map(baseMenuItems, (item) => ({
            key: item.translationKey,
            title: translate(item.translationKey),
            icon: item.icon,
            iconRight: item.iconRight,
            onPress: item.action,
            shouldShowRightIcon: item.shouldShowRightIcon,
            shouldBlockSelection: Boolean(item.link),
            wrapperStyle: styles.sectionMenuItem,
            isPaneMenu: true,
            focused: item.focused,
        }));
    }, [isSmallScreenWidth, styles.sectionMenuItem, translate, waitForNavigate]);

    return (
        <ScreenWrapper
            testID={AllSettingsScreen.displayName}
            includePaddingTop={false}
            includeSafeAreaPaddingBottom={false}
            shouldDisableSafeAreaPaddingBottom
        >
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
            <ScrollView style={[styles.pb4, styles.mh3]}>
                <MenuItemList
                    menuItems={menuItems}
                    shouldUseSingleExecution
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

AllSettingsScreen.displayName = 'AllSettingsScreen';

export default AllSettingsScreen;
