import ConfirmationPage from '@components/ConfirmationPage';
/**
 * Builds the ConfirmationPage config (heading, description, CTA, buttons, illustration) for each merge-account result.
 */
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';

import {closeReactNativeApp} from '@userActions/HybridApp';
import {openOldDotLink} from '@userActions/Link';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {StyleProp, ViewStyle} from 'react-native';
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
    heading?: string;
    descriptionComponent?: React.ReactNode;
    ctaComponent?: React.ReactNode;
    onButtonPress?: () => void;
    illustration?: DotLottieAnimation | IconAsset;
    illustrationStyle?: StyleProp<ViewStyle>;
    secondaryButtonText?: string;
    onSecondaryButtonPress?: () => void;
    shouldShowSecondaryButton?: boolean;
};

function DescriptionHTML({html}: {html: string}) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
            <RenderHTML html={html} />
        </View>
    );
}

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
        illustration: lazyIllustrations.LockClosedOrange,
        onButtonPress: () => {},
    };

    const results: Record<ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS>, MergeResultConfirmationConfig> = {
        [CONST.MERGE_ACCOUNT_RESULTS.SUCCESS]: {
            heading: translate('mergeAccountsPage.mergeSuccess.accountsMerged'),
            descriptionComponent: <DescriptionHTML html={translate('mergeAccountsPage.mergeSuccess.description', login, userEmailOrPhone ?? '')} />,
            illustration: LottieAnimations.Fireworks,
            illustrationStyle: {width: 150, height: 150},
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ERR_NO_EXIST]: {
            descriptionComponent: (
                <DescriptionHTML
                    html={translate('mergeAccountsPage.mergeFailureUncreatedAccountDescription', login, `${environmentURL}/${buildDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHODS.path)}`)}
                />
            ),
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ERR_2FA]: {
            descriptionComponent: <DescriptionHTML html={translate('mergeAccountsPage.mergeFailure2FA.description', login)} />,
            ctaComponent: (
                <Text style={[styles.textAlignCenter, styles.mt2, styles.textSupporting]}>
                    <TextLink href={CONST.MERGE_ACCOUNT_HELP_URL}>{translate('mergeAccountsPage.mergeFailure2FA.learnMore')}</TextLink>
                </Text>
            ),
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ERR_SMART_SCANNER]: {
            descriptionComponent: <DescriptionHTML html={translate('mergeAccountsPage.mergeFailureSmartScannerAccountDescription', login)} />,
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_DOMAIN_CONTROL]: {
            descriptionComponent: <DescriptionHTML html={translate('mergeAccountsPage.mergeFailureSAMLDomainControlDescription', login)} />,
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_NOT_SUPPORTED]: {
            heading: translate('mergeAccountsPage.mergePendingSAML.weAreWorkingOnIt'),
            descriptionComponent: <ConfirmationPage.Description style={styles.textSupporting}>{translate('mergeAccountsPage.mergePendingSAML.limitedSupport')}</ConfirmationPage.Description>,
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
            illustration: lazyIllustrations.RunningTurtle,
            illustrationStyle: {width: 132, height: 150},
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_PRIMARY_LOGIN]: {
            descriptionComponent: <DescriptionHTML html={translate('mergeAccountsPage.mergeFailureSAMLAccountDescription', login)} />,
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ERR_ACCOUNT_LOCKED]: {
            descriptionComponent: <DescriptionHTML html={translate('mergeAccountsPage.mergeFailureAccountLockedDescription', login)} />,
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING]: {
            descriptionComponent: <DescriptionHTML html={translate('mergeAccountsPage.mergeFailureInvoicedAccountDescription', login)} />,
        },
        [CONST.MERGE_ACCOUNT_RESULTS.TOO_MANY_ATTEMPTS]: {
            heading: translate('mergeAccountsPage.mergeFailureTooManyAttempts.heading'),
            descriptionComponent: (
                <ConfirmationPage.Description style={styles.textSupporting}>{translate('mergeAccountsPage.mergeFailureTooManyAttempts.description')}</ConfirmationPage.Description>
            ),
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ACCOUNT_UNVALIDATED]: {
            descriptionComponent: (
                <ConfirmationPage.Description style={styles.textSupporting}>{translate('mergeAccountsPage.mergeFailureUnvalidatedAccount.description')}</ConfirmationPage.Description>
            ),
        },
        [CONST.MERGE_ACCOUNT_RESULTS.ERR_MERGE_SELF]: {
            descriptionComponent: (
                <ConfirmationPage.Description style={styles.textSupporting}>{translate('mergeAccountsPage.mergeFailureSelfMerge.description')}</ConfirmationPage.Description>
            ),
        },
    };

    return results[result] || defaultResult;
}

export default useMergeResultConfirmationConfig;
