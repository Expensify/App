import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import RenderHTML from '@components/RenderHTML';
import TextLink from '@components/TextLink';

import Navigation from '@libs/Navigation/Navigation';
import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';

import {closeReactNativeApp} from '@userActions/HybridApp';
import {openOldDotLink} from '@userActions/Link';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {emailSelector} from '@selectors/Session';
import React from 'react';
import {View} from 'react-native';

import useEnvironment from './useEnvironment';
import {useMemoizedLazyIllustrations} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useScreenBoundDynamicRoute from './useScreenBoundDynamicRoute';
import useThemeStyles from './useThemeStyles';

type MergeResultConfirmationConfig = {
    heading: string;
    headingStyle?: TextStyle;
    description?: React.ReactNode;
    descriptionStyle?: StyleProp<TextStyle>;
    descriptionComponent?: React.ReactNode;
    cta?: React.ReactNode;
    ctaComponent?: React.ReactNode;
    ctaStyle?: TextStyle;
    buttonText: string;
    onButtonPress?: () => void;
    illustration?: DotLottieAnimation | IconAsset;
    illustrationStyle?: StyleProp<ViewStyle>;
    secondaryButtonText?: string;
    onSecondaryButtonPress?: () => void;
    shouldShowSecondaryButton?: boolean;
};

function useMergeResultConfirmationConfig({result, login}: {result: ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS>; login: string}): MergeResultConfirmationConfig {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [userEmailOrPhone] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});
    const {environmentURL} = useEnvironment();
    const buildDynamicRoute = useScreenBoundDynamicRoute();
    const lazyIllustrations = useMemoizedLazyIllustrations(['RunningTurtle', 'LockClosedOrange']);
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);
    const isClassicRedirectBlocked = shouldHideOldAppRedirect(tryNewDot, isLoadingTryNewDot, CONFIG.IS_HYBRID_APP);

    const defaultResult = {
        heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
        buttonText: translate('common.buttonConfirm'),
        illustration: lazyIllustrations.LockClosedOrange,
    };

    const results: Record<ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS>, MergeResultConfirmationConfig> = {
        [CONST.MERGE_ACCOUNT_RESULTS.SUCCESS]: {
            heading: translate('mergeAccountsPage.mergeSuccess.accountsMerged'),
            descriptionComponent: (
                <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                    <RenderHTML html={translate('mergeAccountsPage.mergeSuccess.description', login, userEmailOrPhone ?? '')} />
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
                        html={translate('mergeAccountsPage.mergeFailureUncreatedAccountDescription', login, `${environmentURL}/${buildDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHODS.path)}`)}
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
                    <RenderHTML html={translate('mergeAccountsPage.mergeFailure2FA.description', login)} />
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
                    <RenderHTML html={translate('mergeAccountsPage.mergeFailureSmartScannerAccountDescription', login)} />
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
                    <RenderHTML html={translate('mergeAccountsPage.mergeFailureSAMLDomainControlDescription', login)} />
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
            shouldShowSecondaryButton: !isClassicRedirectBlocked,
            buttonText: translate('common.buttonConfirm'),
            onButtonPress: () => Navigation.goBack(ROUTES.SETTINGS_SECURITY),
            illustration: lazyIllustrations.RunningTurtle,
            illustrationStyle: {width: 132, height: 150},
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_PRIMARY_LOGIN]: {
            heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
            descriptionComponent: (
                <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                    <RenderHTML html={translate('mergeAccountsPage.mergeFailureSAMLAccountDescription', login)} />
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
                    <RenderHTML html={translate('mergeAccountsPage.mergeFailureAccountLockedDescription', login)} />
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
                    <RenderHTML html={translate('mergeAccountsPage.mergeFailureInvoicedAccountDescription', login)} />
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

    return results[result] || defaultResult;
}

export default useMergeResultConfirmationConfig;
