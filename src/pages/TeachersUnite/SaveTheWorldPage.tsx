import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

function SaveTheWorldPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const waitForNavigate = useWaitForNavigation();
    const {isSmallScreenWidth} = useWindowDimensions();
    const theme = useTheme();

    const menuItems = useMemo(() => {
        const baseMenuItems = [
            {
                translationKey: 'teachersUnitePage.iKnowATeacher',
                action: waitForNavigate(() => Navigation.navigate(ROUTES.I_KNOW_A_TEACHER)),
            },
            {
                translationKey: 'teachersUnitePage.iAmATeacher',
                action: waitForNavigate(() => Navigation.navigate(ROUTES.I_AM_A_TEACHER)),
            },
        ];

        return baseMenuItems.map((item) => ({
            key: item.translationKey,
            title: translate(item.translationKey as TranslationPaths),
            onPress: item.action,
            shouldShowRightIcon: true,
            link: '',
            wrapperStyle: [styles.sectionMenuItemTopDescription],
        }));
    }, [translate, waitForNavigate, styles]);

    return (
        <ScreenWrapper
            testID={SaveTheWorldPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('sidebarScreen.saveTheWorld')}
                shouldShowBackButton={isSmallScreenWidth}
                onBackButtonPress={() => Navigation.goBack()}
                icon={Illustrations.TeachersUnite}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('teachersUnitePage.teachersUnite')}
                        subtitle={translate('teachersUnitePage.joinExpensifyOrg')}
                        isCentralPane
                        subtitleMuted
                        illustration={LottieAnimations.SaveTheWorld}
                        illustrationBackgroundColor={theme.PAGE_THEMES[SCREENS.SAVE_THE_WORLD.ROOT].backgroundColor}
                        titleStyles={styles.accountSettingsSectionTitle}
                        childrenStyles={styles.pt5}
                    >
                        <MenuItemList
                            menuItems={menuItems}
                            shouldUseSingleExecution
                        />
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

SaveTheWorldPage.displayName = 'SettingSecurityPage';

export default SaveTheWorldPage;
