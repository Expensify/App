import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import {navigateToConciergeChat} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function Finish() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['NewWindow', 'Shield', 'ChatBubble']);
    const illustrations = useMemoizedLazyIllustrations(['ConciergeBubble', 'ShieldYellow']);

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const policyID = reimbursementAccount?.achData?.policyID;

    const handleBackButtonPress = () => {
        Navigation.goBack();
    };
    const handleNavigateToConciergeChat = () => navigateToConciergeChat(conciergeReportID, true);

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
                                Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID})));
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
