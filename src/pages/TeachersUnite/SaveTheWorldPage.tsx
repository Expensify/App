import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import useSaveTheWorldSectionIllustration from './useSaveTheWorldSectionIllustration';

function SaveTheWorldPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const waitForNavigate = useWaitForNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const illustrations = useMemoizedLazyIllustrations(['TeachersUnite']);
    const saveTheWorldIllustration = useSaveTheWorldSectionIllustration();
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
            testID="SaveTheWorldPage"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('sidebarScreen.saveTheWorld')}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                onBackButtonPress={Navigation.popToSidebar}
                icon={illustrations.TeachersUnite}
                shouldUseHeadlineHeader
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('teachersUnitePage.teachersUnite')}
                        subtitle={translate('teachersUnitePage.joinExpensifyOrg')}
                        isCentralPane
                        subtitleMuted
                        illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                        illustrationBackgroundColor={theme.PAGE_THEMES[SCREENS.SAVE_THE_WORLD.ROOT].backgroundColor}
                        titleStyles={styles.accountSettingsSectionTitle}
                        childrenStyles={styles.pt5}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...saveTheWorldIllustration}
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

export default SaveTheWorldPage;
