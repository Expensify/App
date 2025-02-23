import {useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ConfirmationPage from '@components/ConfirmationPage';
import type {ConfirmationPageProps} from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {openOldDotLink} from '@userActions/Link';
import {clearMergeWithValidateCode, clearRequestValidationCodeForAccountMerge} from '@userActions/MergeAccounts';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function MergeResultPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [userEmailOrPhone] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const {params} = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT>>();
    const {result, login} = params;

    const defaultResult = {
        heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
        buttonText: translate('common.buttonConfirm'),
        illustration: Illustrations.LockClosedOrange,
    };

    const results: Record<ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS>, ConfirmationPageProps> = useMemo(() => {
        return {
            [CONST.MERGE_ACCOUNT_RESULTS.SUCCESS]: {
                heading: translate('mergeAccountsPage.mergeSuccess.accountsMerged'),
                description: translate('mergeAccountsPage.mergeSuccess.successfullyMergedAllData', {email: login, newEmail: userEmailOrPhone ?? ''}),
                primaryButtonText: translate('common.buttonConfirm'),
                illustration: LottieAnimations.Fireworks,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_NO_EXIST]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailureUncreatedAccount.noExpensifyAccount', {email: login})}{' '}
                        {translate('mergeAccountsPage.mergeFailureUncreatedAccount.addContactMethod.beforeLink')}
                        <TextLink
                            onPress={() => {
                                Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS.getRoute());
                            }}
                        >
                            {translate('mergeAccountsPage.mergeFailureUncreatedAccount.addContactMethod.linkText')}
                        </TextLink>
                        {translate('mergeAccountsPage.mergeFailureUncreatedAccount.addContactMethod.afterLink')}
                    </>
                ),
                primaryButtonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_2FA]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailure2FA.oldAccount2FAEnabled', {email: login})}{' '}
                        <Text style={[styles.dBlock, styles.textAlignCenter]}>
                            <TextLink href={CONST.MERGE_ACCOUNT_HELP_URL}>{translate('mergeAccountsPage.mergeFailure2FA.learnMore')}</TextLink>
                        </Text>
                    </>
                ),
                primaryButtonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SMART_SCANNER]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: translate('mergeAccountsPage.mergeFailureSmartScannerAccount', {email: login}),
                primaryButtonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_DOMAIN_CONTROL]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.beforeLink', {email: login})}
                        <TextLink
                            onPress={() => {
                                navigateToConciergeChat();
                            }}
                        >
                            {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.linkText')}
                        </TextLink>
                        {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.afterLink')}
                    </>
                ),
                primaryButtonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_NOT_SUPPORTED]: {
                heading: translate('mergeAccountsPage.mergePendingSAML.weAreWorkingOnIt'),
                description: (
                    <>
                        <Text>{translate('mergeAccountsPage.mergePendingSAML.limitedSupport')}</Text>
                        <Text style={[styles.dBlock, styles.textAlignCenter]}>
                            {translate('mergeAccountsPage.mergePendingSAML.reachOutForHelp.beforeLink')}
                            <TextLink
                                onPress={() => {
                                    navigateToConciergeChat();
                                }}
                            >
                                {translate('mergeAccountsPage.mergePendingSAML.reachOutForHelp.linkText')}
                            </TextLink>
                            {translate('mergeAccountsPage.mergePendingSAML.reachOutForHelp.afterLink')}
                        </Text>
                    </>
                ),
                secondaryButtonText: translate('mergeAccountsPage.mergePendingSAML.goToExpensifyClassic'),
                onSecondaryButtonPress: () => openOldDotLink(CONST.OLDDOT_URLS.INBOX, true),
                shouldShowSecondaryButton: true,
                primaryButtonText: translate('common.buttonConfirm'),
                illustration: Illustrations.RunningTurtle,
                illustrationStyle: {width: 132, height: 150},
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_PRIMARY_LOGIN]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: translate('mergeAccountsPage.mergeFailureSAMLAccount', {email: login}),
                primaryButtonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_ACCOUNT_LOCKED]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailureAccountLocked.beforeLink', {email: login})}
                        <TextLink
                            onPress={() => {
                                navigateToConciergeChat();
                            }}
                        >
                            {translate('mergeAccountsPage.mergeFailureAccountLocked.linkText')}
                        </TextLink>
                        {translate('mergeAccountsPage.mergeFailureAccountLocked.afterLink')}
                    </>
                ),
                primaryButtonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: translate('mergeAccountsPage.mergeFailureInvoicedAccount', {email: login}),
                primaryButtonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
        };
    }, [login, translate, userEmailOrPhone, styles]);

    const {
        heading,
        headingStyle,
        onPrimaryButtonPress,
        descriptionStyle,
        illustration,
        illustrationStyle,
        description,
        primaryButtonText,
        secondaryButtonText,
        onSecondaryButtonPress,
        shouldShowSecondaryButton,
    } = results[result] || defaultResult;

    useEffect(() => {
        return () => {
            clearRequestValidationCodeForAccountMerge();
            clearMergeWithValidateCode();
        };
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={MergeResultPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('mergeAccountsPage.mergeAccount')}
                onBackButtonPress={() => {
                    Navigation.dismissModal();
                }}
            />
            <ConfirmationPage
                heading={heading}
                headingStyle={headingStyle}
                onPrimaryButtonPress={onPrimaryButtonPress}
                shouldShowPrimaryButton
                primaryButtonText={primaryButtonText}
                shouldShowSecondaryButton={shouldShowSecondaryButton}
                secondaryButtonText={secondaryButtonText}
                onSecondaryButtonPress={onSecondaryButtonPress}
                description={description}
                descriptionStyle={descriptionStyle}
                illustration={illustration}
                illustrationStyle={illustrationStyle}
            />
        </ScreenWrapper>
    );
}

MergeResultPage.displayName = 'MergeResultPage';

export default MergeResultPage;
