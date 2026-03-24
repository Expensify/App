import React from 'react';
import HeaderWithBackButton from "@components/HeaderWithBackButton";
import ScreenWrapper from "@components/ScreenWrapper";
import { useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations } from "@hooks/useLazyAsset";
import useLocalize from "@hooks/useLocalize";
import useResponsiveLayout from "@hooks/useResponsiveLayout";
import Navigation from "@libs/Navigation/Navigation";
import ScrollView from '@components/ScrollView';
import useThemeStyles from '@hooks/useThemeStyles';
import { View } from 'react-native';
import Section from '@components/Section';
import colors from '@styles/theme/colors';
import { openExternalLink } from '@libs/actions/Link';
import CONST from '@src/CONST';
import MenuItemList from '@components/MenuItemList';

function HelpPage() {
    const icons = useMemoizedLazyExpensifyIcons(['NewWindow', 'Monitor']);
    const illustrations = useMemoizedLazyIllustrations(['LifeRing', 'TopiaryDollarSign']);
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const menuItems = [
        {
            key: 'initialSettingsPage.helpPage.helpSite',
            title: translate('initialSettingsPage.helpPage.helpSite'),
            icon: icons.Monitor,
            iconRight: icons.NewWindow,
            onPress: () => openExternalLink(CONST.NEWHELP_URL),
            shouldShowRightIcon: true,
            wrapperStyle: [styles.sectionMenuItemTopDescription],
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_PREFERENCES.PRIORITY_MODE,
        }
    ]

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="HelpPage"
        >
            <HeaderWithBackButton
                title={translate('common.help')}
                icon={illustrations.LifeRing}
                shouldUseHeadlineHeader
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                shouldDisplayHelpButton
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('initialSettingsPage.helpPage.title')}
                        subtitle={translate('initialSettingsPage.helpPage.description')}
                        titleStyles={styles.accountSettingsSectionTitle}
                        isCentralPane
                        illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                        illustrationBackgroundColor={colors.ice800}
                        illustration={illustrations.TopiaryDollarSign}
                        illustrationStyle={styles.helpStaticIllustration}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <MenuItemList
                                menuItems={menuItems}
                                shouldUseSingleExecution
                            />
                        </View>
                    </Section>
                </View>
            </ScrollView>
            
        </ScreenWrapper>
    );           
}

export default HelpPage;