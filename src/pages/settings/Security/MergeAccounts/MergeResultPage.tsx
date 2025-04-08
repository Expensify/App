import HybridAppModule from '@expensify/react-native-hybrid-app';
import {useRoute} from '@react-navigation/native';
import React, {useContext, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ConfirmationPage from '@components/ConfirmationPage';
import type {ConfirmationPageProps} from '@components/ConfirmationPage';
import CustomStatusBarAndBackgroundContext from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
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
import {navigateToConciergeChat} from '@userActions/Report';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function MergeResultPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);
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
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeSuccess.successfullyMergedAllData.beforeFirstEmail')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{login}</Text>
                        {translate('mergeAccountsPage.mergeSuccess.successfullyMergedAllData.beforeSecondEmail')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{userEmailOrPhone}</Text>
                        {translate('mergeAccountsPage.mergeSuccess.successfullyMergedAllData.afterSecondEmail')}
                    </>
                ),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: LottieAnimations.Fireworks,
                illustrationStyle: {width: 150, height: 150},
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_NO_EXIST]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailureUncreatedAccount.noExpensifyAccount.beforeEmail')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{login}</Text>
                        {translate('mergeAccountsPage.mergeFailureUncreatedAccount.noExpensifyAccount.afterEmail')}{' '}
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
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_2FA]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailure2FA.oldAccount2FAEnabled.beforeFirstEmail')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{login}</Text>
                        {translate('mergeAccountsPage.mergeFailure2FA.oldAccount2FAEnabled.beforeSecondEmail')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{login}</Text>
                        {translate('mergeAccountsPage.mergeFailure2FA.oldAccount2FAEnabled.afterSecondEmail')}
                    </>
                ),
                cta: <TextLink href={CONST.MERGE_ACCOUNT_HELP_URL}>{translate('mergeAccountsPage.mergeFailure2FA.learnMore')}</TextLink>,
                ctaStyle: {...styles.mt2, ...styles.textSupporting},
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SMART_SCANNER]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailureSmartScannerAccount.beforeEmail')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{login}</Text>
                        {translate('mergeAccountsPage.mergeFailureSmartScannerAccount.afterEmail')}
                    </>
                ),
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_DOMAIN_CONTROL]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.beforeFirstEmail')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{login}</Text>
                        {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.beforeDomain')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{login.split('@').at(1)}</Text>
                        {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.afterDomain')}
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
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_NOT_SUPPORTED]: {
                heading: translate('mergeAccountsPage.mergePendingSAML.weAreWorkingOnIt'),
                description: (
                    <>
                        <Text style={[styles.textSupporting, styles.textAlignCenter]}>{translate('mergeAccountsPage.mergePendingSAML.limitedSupport')}</Text>
                        <Text style={[styles.dBlock, styles.textAlignCenter, styles.textSupporting, styles.mt2]}>
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
                onSecondaryButtonPress: () => {
                    if (CONFIG.IS_HYBRID_APP) {
                        HybridAppModule.closeReactNativeApp({shouldSignOut: false, shouldSetNVP: true});
                        setRootStatusBarEnabled(false);
                        return;
                    }
                    openOldDotLink(CONST.OLDDOT_URLS.INBOX, false);
                },
                shouldShowSecondaryButton: true,
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: Illustrations.RunningTurtle,
                illustrationStyle: {width: 132, height: 150},
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_PRIMARY_LOGIN]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailureSAMLAccount.beforeEmail')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{login}</Text>
                        {translate('mergeAccountsPage.mergeFailureSAMLAccount.afterEmail')}
                    </>
                ),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_ACCOUNT_LOCKED]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailureAccountLocked.beforeEmail')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{login}</Text>
                        {translate('mergeAccountsPage.mergeFailureAccountLocked.afterEmail')}
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
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (
                    <>
                        {translate('mergeAccountsPage.mergeFailureInvoicedAccount.beforeEmail')}
                        <Text style={[styles.textStrong, styles.textSupporting]}>{login}</Text>
                        {translate('mergeAccountsPage.mergeFailureInvoicedAccount.afterEmail')}
                    </>
                ),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.TOO_MANY_ATTEMPTS]: {
                heading: translate('mergeAccountsPage.mergeFailureTooManyAttempts.heading'),
                description: translate('mergeAccountsPage.mergeFailureTooManyAttempts.description'),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ACCOUNT_UNVALIDATED]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: translate('mergeAccountsPage.mergeFailureUnvalidatedAccount.description'),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: Illustrations.LockClosedOrange,
            },
        };
    }, [setRootStatusBarEnabled, login, translate, userEmailOrPhone, styles]);

    const {
        heading,
        headingStyle,
        onButtonPress,
        descriptionStyle,
        illustration,
        illustrationStyle,
        description,
        buttonText,
        secondaryButtonText,
        onSecondaryButtonPress,
        shouldShowSecondaryButton,
        cta,
        ctaStyle,
    } = results[result] || defaultResult;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={MergeResultPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('mergeAccountsPage.mergeAccount')}
                shouldShowBackButton={result !== CONST.MERGE_ACCOUNT_RESULTS.SUCCESS}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SETTINGS_MERGE_ACCOUNTS.getRoute(login));
                }}
                shouldDisplayHelpButton={false}
            />
            <ConfirmationPage
                containerStyle={{...styles.flexGrow1, ...styles.mt3}}
                heading={heading}
                headingStyle={headingStyle}
                onButtonPress={onButtonPress}
                shouldShowButton
                buttonText={buttonText}
                shouldShowSecondaryButton={shouldShowSecondaryButton}
                secondaryButtonText={secondaryButtonText}
                onSecondaryButtonPress={onSecondaryButtonPress}
                description={description}
                descriptionStyle={{...descriptionStyle, ...styles.textSupporting}}
                illustration={illustration}
                illustrationStyle={illustrationStyle}
                cta={cta}
                ctaStyle={ctaStyle}
            />
        </ScreenWrapper>
    );
}

MergeResultPage.displayName = 'MergeResultPage';

export default MergeResultPage;
