import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import {updateAddPersonalBankAccountDraft} from '@userActions/BankAccounts';
import {openExternalLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type AccountFlowEntryPointProps = {
    /** The workspace name */
    policyName?: string;

    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

function AccountFlowEntryPoint({policyName = '', onBackButtonPress}: AccountFlowEntryPointProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bank', 'Connect', 'Lightbulb', 'Lock'] as const);

    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED, {canBeMissing: true});

    const handleConnectManually = () => {
        updateAddPersonalBankAccountDraft({
            setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
        });
        Navigation.navigate(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT);
    };

    const handleConnectPlaid = () => {
        updateAddPersonalBankAccountDraft({
            setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
        });
        Navigation.navigate(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={AccountFlowEntryPoint.displayName}
        >
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
                subtitle={policyName}
                onBackButtonPress={onBackButtonPress}
            />

            <ScrollView style={styles.flex1}>
                <Section
                    title={translate('workspace.bankAccount.streamlinePayments')}
                    titleStyles={styles.textHeadline}
                    subtitle={translate('addPersonalBankAccount.toGetStarted')}
                    subtitleStyles={styles.textSupporting}
                    subtitleMuted
                    illustration={LottieAnimations.FastMoney}
                    illustrationBackgroundColor={theme.fallbackIconColor}
                    isCentralPane
                >
                    <View style={[styles.flexRow, styles.mt4, styles.alignItemsCenter, styles.pb1, styles.pt1]}>
                        <Icon
                            src={expensifyIcons.Lightbulb}
                            fill={theme.icon}
                            additionalStyles={styles.mr2}
                            medium
                        />
                        <Text
                            style={[styles.textLabelSupportingNormal, styles.flex1]}
                            suppressHighlighting
                        >
                            {translate('workspace.bankAccount.connectBankAccountNote')}
                        </Text>
                    </View>
                    <View style={styles.mt4}>
                        <MenuItem
                            title={translate('bankAccount.connectOnlineWithPlaid')}
                            icon={expensifyIcons.Bank}
                            disabled={!!isPlaidDisabled}
                            onPress={handleConnectPlaid}
                            shouldShowRightIcon
                            outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                        />
                        <MenuItem
                            title={translate('bankAccount.connectManually')}
                            icon={expensifyIcons.Connect}
                            onPress={handleConnectManually}
                            shouldShowRightIcon
                            outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                        />
                    </View>
                </Section>
                <View style={[styles.mv0, styles.mh5, styles.flexRow, styles.justifyContentBetween]}>
                    <TextLink href={CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}>{translate('common.privacy')}</TextLink>
                    <PressableWithoutFeedback
                        onPress={() => openExternalLink(CONST.ENCRYPTION_AND_SECURITY_HELP_URL)}
                        style={[styles.flexRow, styles.alignItemsCenter]}
                        accessibilityLabel={translate('bankAccount.yourDataIsSecure')}
                    >
                        <TextLink href={CONST.ENCRYPTION_AND_SECURITY_HELP_URL}>{translate('bankAccount.yourDataIsSecure')}</TextLink>
                        <View style={styles.ml1}>
                            <Icon
                                src={expensifyIcons.Lock}
                                fill={theme.link}
                            />
                        </View>
                    </PressableWithoutFeedback>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

AccountFlowEntryPoint.displayName = 'AccountFlowEntryPoint';

export default AccountFlowEntryPoint;
