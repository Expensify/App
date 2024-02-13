import React, {useMemo} from 'react';
import {ScrollView} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Breadcrumbs from '@components/Breadcrumbs';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import shouldShowSubscriptionsMenu from '@libs/shouldShowSubscriptionsMenu';
import {hasGlobalWorkspaceSettingsRBR} from '@libs/WorkspacesSettingsUtils';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyMembers} from '@src/types/onyx';

type AllSettingsScreenOnyxProps = {
    policies: OnyxCollection<Policy>;
    policyMembers: OnyxCollection<PolicyMembers>;
};

type AllSettingsScreenProps = AllSettingsScreenOnyxProps;

function AllSettingsScreen({policies, policyMembers}: AllSettingsScreenProps) {
    const styles = useThemeStyles();
    const waitForNavigate = useWaitForNavigation();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    /**
     * Retuns a list of menu items data for All workspaces settings
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
                focused: !shouldUseNarrowLayout,
                brickRoadIndicator: hasGlobalWorkspaceSettingsRBR(policies, policyMembers) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            },
            ...(shouldShowSubscriptionsMenu
                ? [
                      {
                          translationKey: 'allSettingsScreen.subscriptions',
                          icon: Expensicons.MoneyBag,
                          action: () => {
                              Link.openOldDotLink(CONST.OLDDOT_URLS.ADMIN_POLICIES_URL);
                          },
                          shouldShowRightIcon: true,
                          iconRight: Expensicons.NewWindow,
                          link: () => Link.buildOldDotURL(CONST.OLDDOT_URLS.ADMIN_POLICIES_URL),
                      },
                  ]
                : []),
            {
                translationKey: 'allSettingsScreen.cardsAndDomains',
                icon: Expensicons.CardsAndDomains,
                action: () => {
                    Link.openOldDotLink(CONST.OLDDOT_URLS.ADMIN_DOMAINS_URL);
                },
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
                link: () => Link.buildOldDotURL(CONST.OLDDOT_URLS.ADMIN_DOMAINS_URL),
            },
        ];
        return baseMenuItems.map((item) => ({
            key: item.translationKey,
            title: translate(item.translationKey as TranslationPaths),
            icon: item.icon,
            link: item.link,
            iconRight: item.iconRight,
            onPress: item.action,
            shouldShowRightIcon: item.shouldShowRightIcon,
            shouldBlockSelection: Boolean(item.link),
            wrapperStyle: styles.sectionMenuItem,
            isPaneMenu: true,
            focused: item.focused,
            hoverAndPressStyle: styles.hoveredComponentBG,
            brickRoadIndicator: item.brickRoadIndicator,
        }));
    }, [shouldUseNarrowLayout, styles.hoveredComponentBG, styles.sectionMenuItem, translate, waitForNavigate, policies, policyMembers]);

    return (
        <ScreenWrapper
            testID={AllSettingsScreen.displayName}
            includePaddingTop={false}
            includeSafeAreaPaddingBottom={false}
            style={[styles.pb0]}
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
                style={[styles.mb5, styles.ph5]}
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

export default withOnyx<AllSettingsScreenProps, AllSettingsScreenOnyxProps>({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    policyMembers: {
        key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
    },
})(AllSettingsScreen);
