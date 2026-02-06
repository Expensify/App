import {useRoute} from '@react-navigation/native';
import {emailSelector} from '@selectors/Session';
import React, {useEffect, useMemo} from 'react';
import {InteractionManager, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ConfirmationPage from '@components/ConfirmationPage';
import type {ConfirmationPageProps} from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {closeReactNativeApp} from '@userActions/HybridApp';
import {openOldDotLink} from '@userActions/Link';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';

function MergeResultPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [userEmailOrPhone] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: true});
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true, selector: isTrackingSelector});
    const {params} = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT>>();
    const {environmentURL} = useEnvironment();
    const {result, login, backTo} = params;
    const lazyIllustrations = useMemoizedLazyIllustrations(['RunningTurtle', 'LockClosedOrange']);

    const defaultResult = {
        heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
        buttonText: translate('common.buttonConfirm'),
        illustration: lazyIllustrations.LockClosedOrange,
    };

    const results: Record<ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS>, ConfirmationPageProps> = useMemo(() => {
        return {
            [CONST.MERGE_ACCOUNT_RESULTS.SUCCESS]: {
                heading: translate('mergeAccountsPage.mergeSuccess.accountsMerged'),
                descriptionComponent: (
                    <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                        <RenderHTML html={translate('mergeAccountsPage.mergeSuccess.description', {from: login, to: userEmailOrPhone ?? ''})} />
                    </View>
                ),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: LottieAnimations.Fireworks,
                illustrationStyle: {width: 150, height: 150},
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_NO_EXIST]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                descriptionComponent: (
                    <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                        <RenderHTML
                            html={translate('mergeAccountsPage.mergeFailureUncreatedAccountDescription', {
                                email: login,
                                contactMethodLink: `${environmentURL}/${ROUTES.SETTINGS_CONTACT_METHODS.route}`,
                            })}
                        />
                    </View>
                ),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                buttonText: translate('common.buttonConfirm'),
                illustration: lazyIllustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_2FA]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                descriptionComponent: (
                    <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                        <RenderHTML html={translate('mergeAccountsPage.mergeFailure2FA.description', {email: login})} />
                    </View>
                ),
                cta: <TextLink href={CONST.MERGE_ACCOUNT_HELP_URL}>{translate('mergeAccountsPage.mergeFailure2FA.learnMore')}</TextLink>,
                ctaStyle: {...styles.mt2, ...styles.textSupporting},
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                buttonText: translate('common.buttonConfirm'),
                illustration: lazyIllustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SMART_SCANNER]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                descriptionComponent: (
                    <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                        <RenderHTML html={translate('mergeAccountsPage.mergeFailureSmartScannerAccountDescription', {email: login})} />
                    </View>
                ),
                buttonText: translate('common.buttonConfirm'),
                illustration: lazyIllustrations.LockClosedOrange,
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_DOMAIN_CONTROL]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                descriptionComponent: (
                    <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                        <RenderHTML html={translate('mergeAccountsPage.mergeFailureSAMLDomainControlDescription', {email: login})} />
                    </View>
                ),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: lazyIllustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_NOT_SUPPORTED]: {
                heading: translate('mergeAccountsPage.mergePendingSAML.weAreWorkingOnIt'),
                description: translate('mergeAccountsPage.mergePendingSAML.limitedSupport'),
                ctaComponent: (
                    <View style={[styles.renderHTML, styles.mt2, styles.flexRow]}>
                        <RenderHTML html={translate('mergeAccountsPage.mergePendingSAML.reachOutForHelp')} />
                    </View>
                ),
                secondaryButtonText: translate('mergeAccountsPage.mergePendingSAML.goToExpensifyClassic'),
                onSecondaryButtonPress: () => {
                    if (CONFIG.IS_HYBRID_APP) {
                        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS});
                        return;
                    }
                    openOldDotLink(CONST.OLDDOT_URLS.INBOX, false);
                },
                shouldShowSecondaryButton: true,
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: lazyIllustrations.RunningTurtle,
                illustrationStyle: {width: 132, height: 150},
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_PRIMARY_LOGIN]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                descriptionComponent: (
                    <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                        <RenderHTML html={translate('mergeAccountsPage.mergeFailureSAMLAccountDescription', {email: login})} />
                    </View>
                ),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: lazyIllustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_ACCOUNT_LOCKED]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                descriptionComponent: (
                    <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                        <RenderHTML html={translate('mergeAccountsPage.mergeFailureAccountLockedDescription', {email: login})} />
                    </View>
                ),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: lazyIllustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                descriptionComponent: (
                    <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                        <RenderHTML html={translate('mergeAccountsPage.mergeFailureInvoicedAccountDescription', {email: login})} />
                    </View>
                ),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: lazyIllustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.TOO_MANY_ATTEMPTS]: {
                heading: translate('mergeAccountsPage.mergeFailureTooManyAttempts.heading'),
                description: translate('mergeAccountsPage.mergeFailureTooManyAttempts.description'),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: lazyIllustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ACCOUNT_UNVALIDATED]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: translate('mergeAccountsPage.mergeFailureUnvalidatedAccount.description'),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: lazyIllustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_MERGE_SELF]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: translate('mergeAccountsPage.mergeFailureSelfMerge.description'),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
                illustration: lazyIllustrations.LockClosedOrange,
            },
        };
    }, [login, translate, userEmailOrPhone, styles, isTrackingGPS, environmentURL, lazyIllustrations.LockClosedOrange, lazyIllustrations.RunningTurtle]);

    useEffect(() => {
        /**
         * If the result is success, we need to remove the initial screen from the navigation state
         * so that the back button closes the modal instead of going back to the initial screen.
         */
        if (result !== CONST.MERGE_ACCOUNT_RESULTS.SUCCESS) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            Navigation.removeScreenFromNavigationState(SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_DETAILS);
        });
    }, [result]);

    const {
        heading,
        headingStyle,
        onButtonPress,
        descriptionStyle,
        illustration,
        illustrationStyle,
        description,
        descriptionComponent,
        buttonText,
        secondaryButtonText,
        onSecondaryButtonPress,
        shouldShowSecondaryButton,
        cta,
        ctaComponent,
        ctaStyle,
    } = results[result] || defaultResult;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="MergeResultPage"
        >
            <HeaderWithBackButton
                title={translate('mergeAccountsPage.mergeAccount')}
                shouldShowBackButton={result !== CONST.MERGE_ACCOUNT_RESULTS.SUCCESS}
                onBackButtonPress={() => {
                    Navigation.goBack(backTo ?? ROUTES.SETTINGS_MERGE_ACCOUNTS.getRoute());
                }}
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
                descriptionStyle={[descriptionStyle, styles.textSupporting]}
                illustration={illustration}
                illustrationStyle={illustrationStyle}
                cta={cta}
                ctaStyle={ctaStyle}
                descriptionComponent={descriptionComponent}
                ctaComponent={ctaComponent}
            />
        </ScreenWrapper>
    );
}

export default MergeResultPage;
