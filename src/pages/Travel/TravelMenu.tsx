import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {ScrollView} from 'react-native';
import Breadcrumbs from '@components/Breadcrumbs';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import type {BottomTabNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type TravelMenuProps = StackScreenProps<BottomTabNavigatorParamList, typeof SCREENS.TRAVEL.HOME>;

function TravelMenu({route}: TravelMenuProps) {
    const styles = useThemeStyles();
    const waitForNavigate = useWaitForNavigation();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    /**
     * Retuns a list of menu items data for Travel menu
     * @returns {Object} object with translationKey, style and items
     */
    const menuItems = useMemo(() => {
        const baseMenuItems = [
            {
                translationKey: 'travel.myTrips',
                icon: Expensicons.Suitcase,
                action: () => {
                    waitForNavigate(() => {
                        Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS);
                    })();
                },
                focused: !isSmallScreenWidth,
            },
        ];
        return baseMenuItems.map((item) => ({
            key: item.translationKey,
            title: translate(item.translationKey as TranslationPaths),
            icon: item.icon,
            onPress: item.action,
            wrapperStyle: styles.sectionMenuItem,
            isPaneMenu: true,
            focused: item.focused,
            hoverAndPressStyle: styles.hoveredComponentBG,
        }));
    }, [isSmallScreenWidth, styles.hoveredComponentBG, styles.sectionMenuItem, translate, waitForNavigate]);

    return (
        <ScreenWrapper
            testID={TravelMenu.displayName}
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
                        text: translate('workspace.common.travel'),
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

TravelMenu.displayName = 'TravelMenu';

export default TravelMenu;
