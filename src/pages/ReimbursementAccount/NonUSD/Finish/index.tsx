import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemNavigation from '@components/MenuItem/presets/MenuItemNavigation';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import Navigation from '@navigation/Navigation';

import {navigateToConciergeChat} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import {View} from 'react-native';

function Finish() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Shield', 'ChatBubble']);
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
                    <View style={styles.mhn5}>
                        <MenuItemNavigation
                            icon={icons.ChatBubble}
                            title={translate('finishStep.iHaveA')}
                            onPress={handleNavigateToConciergeChat}
                        />
                    </View>
                </Section>
                <Section
                    title={translate('finishStep.enable2FA')}
                    icon={illustrations.ShieldYellow}
                    titleStyles={[styles.mb4, styles.textHeadline]}
                    containerStyles={[styles.mh5]}
                >
                    <View style={styles.mb6}>
                        <Text style={[styles.mt3, styles.textLabelSupportingEmptyValue]}>{translate('finishStep.weTake')}</Text>
                    </View>
                    <View style={styles.mhn5}>
                        <MenuItem.Root
                            onPress={callFunctionIfActionIsAllowed(() => {
                                Navigation.navigate(getTwoFactorAuthRoute());
                            })}
                        >
                            <MenuItem.Row>
                                <MenuItem.Leading>
                                    <MenuItem.Icon src={icons.Shield} />
                                </MenuItem.Leading>
                                <MenuItem.Content>
                                    <MenuItem.Title>{translate('finishStep.secure')}</MenuItem.Title>
                                </MenuItem.Content>
                                <MenuItem.Trailing>
                                    <MenuItem.NewWindowIcon />
                                </MenuItem.Trailing>
                            </MenuItem.Row>
                        </MenuItem.Root>
                    </View>
                </Section>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default Finish;
