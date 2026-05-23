import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';
import Navigation from '@navigation/Navigation';
import {navigateToConciergeChat} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';

function Finish() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['NewWindow', 'Shield', 'ChatBubble']);
    const illustrations = useMemoizedLazyIllustrations(['ConciergeBubble', 'ShieldYellow']);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {getTwoFactorAuthRoute} = useTwoFactorAuthRoute();

    const handleBackButtonPress = () => {
        Navigation.dismissModal();
    };
    const handleNavigateToConciergeChat = () => navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, true);

    return (
        <ScreenWrapper
            testID="Finish"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
                onBackButtonPress={handleBackButtonPress}
            />
            <ScrollView style={[styles.flex1]}>
                <Section
                    title={translate('finishStep.letsFinish')}
                    icon={illustrations.ConciergeBubble}
                    containerStyles={[styles.mb8, styles.mh5]}
                    titleStyles={[styles.mb3, styles.textHeadline]}
                >
                    <Text style={[styles.mb6, styles.mt3, styles.textLabelSupportingEmptyValue]}>{translate('finishStep.thanksFor')}</Text>
                    <MenuItem
                        icon={icons.ChatBubble}
                        title={translate('finishStep.iHaveA')}
                        onPress={handleNavigateToConciergeChat}
                        outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                        shouldShowRightIcon
                    />
                </Section>
                <Section
                    title={translate('finishStep.enable2FA')}
                    icon={illustrations.ShieldYellow}
                    titleStyles={[styles.mb4, styles.textHeadline]}
                    containerStyles={[styles.mh5]}
                    menuItems={[
                        {
                            title: translate('finishStep.secure'),
                            onPress: () => {
                                Navigation.navigate(getTwoFactorAuthRoute());
                            },
                            icon: icons.Shield,
                            shouldShowRightIcon: true,
                            iconRight: icons.NewWindow,
                            outerWrapperStyle: shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8,
                        },
                    ]}
                >
                    <View style={styles.mb6}>
                        <Text style={[styles.mt3, styles.textLabelSupportingEmptyValue]}>{translate('finishStep.weTake')}</Text>
                    </View>
                </Section>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default Finish;
