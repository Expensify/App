import {emailSelector} from '@selectors/Session';
import {Str} from 'expensify-common';
import type {ReactElement} from 'react';
import React, {useEffect, useState} from 'react';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {cleanupTravelProvisioningSession, requestTravelAccess} from '@libs/actions/Travel';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import {getActivePolicies, getAdminsPrivateEmailDomains, isPaidGroupPolicy, isWorkspaceProvisionedForTravel} from '@libs/PolicyUtils';
import {getSearchParamFromPath} from '@libs/Url';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import Button from './Button';
import DotIndicatorMessage from './DotIndicatorMessage';
import RenderHTML from './RenderHTML';

type BookTravelButtonProps = WithSentryLabel & {
    text: string;
    activePolicyID?: string;

    /** Whether to render the error message below the button */
    shouldRenderErrorMessageBelowButton?: boolean;

    /** Function to set the shouldScrollToBottom state */
    setShouldScrollToBottom?: (shouldScrollToBottom: boolean) => void;

    shouldShowVerifyAccountModal?: boolean;

    /** Whether to render a large button */
    large?: boolean;
};

const hasPolicyIDInActiveRoute = () => getSearchParamFromPath(Navigation.getActiveRoute(), CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID) !== null;

function BookTravelButton({
    text,
    shouldRenderErrorMessageBelowButton = false,
    activePolicyID,
    setShouldScrollToBottom,
    shouldShowVerifyAccountModal = true,
    sentryLabel,
    large = false,
}: BookTravelButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['RocketDude']);
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const phoneErrorMethodsRoute = `${environmentURL}/${ROUTES.SETTINGS_CONTACT_METHODS.getRoute(Navigation.getActiveRoute())}`;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const isUserValidated = account?.validated ?? false;
    const primaryLogin = account?.primaryLogin ?? '';

    const policy = usePolicy(activePolicyID);
    const [errorMessage, setErrorMessage] = useState<string | ReactElement>('');
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const primaryContactMethod = primaryLogin ?? sessionEmail ?? '';
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const activePolicies = getActivePolicies(policies, currentUserLogin);
    const groupPaidPolicies = activePolicies.filter((activePolicy) => activePolicy.type !== CONST.POLICY.TYPE.PERSONAL && isPaidGroupPolicy(activePolicy));

    const navigateToPublicDomainError = () => {
        const dynamicSuffix = hasPolicyIDInActiveRoute() ? DYNAMIC_ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.path : DYNAMIC_ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.getRoute(activePolicyID);
        Navigation.navigate(createDynamicRoute(dynamicSuffix));
    };

    useEffect(() => {
        if (!errorMessage) {
            return;
        }
        setShouldScrollToBottom?.(true);
    }, [errorMessage, setShouldScrollToBottom]);

    const bookATrip = () => {
        setErrorMessage('');

        if (isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL)) {
            showConfirmModal({
                title: translate('travel.blockedFeatureModal.title'),
                titleStyles: styles.textHeadlineH1,
                titleContainerStyles: styles.mb2,
                prompt: translate('travel.blockedFeatureModal.message'),
                promptStyles: styles.mb2,
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
                image: illustrations.RocketDude,
                imageStyles: StyleUtils.getBackgroundColorStyle(colors.ice600),
            });
            return;
        }

        // The primary login of the user is where Spotnana sends the emails with booking confirmations, itinerary etc. It can't be a phone number.
        if (!primaryContactMethod || Str.isSMSLogin(primaryContactMethod)) {
            setErrorMessage(<RenderHTML html={translate('travel.phoneError', phoneErrorMethodsRoute)} />);
            return;
        }

        // Spotnana requires a private domain email for travel booking
        if (isEmailPublicDomain(primaryContactMethod)) {
            navigateToPublicDomainError();
            return;
        }

        const adminDomains = getAdminsPrivateEmailDomains(policy);
        if (adminDomains.length === 0) {
            navigateToPublicDomainError();
            return;
        }

        if (groupPaidPolicies.length < 1) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRAVEL_UPGRADE.path));
            return;
        }

        if (!isPaidGroupPolicy(policy)) {
            setErrorMessage(translate('travel.termsAndConditions.defaultWorkspaceError'));
            return;
        }

        const isPolicyProvisioned = isWorkspaceProvisionedForTravel(policy?.travelSettings);
        if (policy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned)) {
            openTravelDotLink(policy?.id);
            return;
        }

        // Legacy request-access path for unprovisioned workspaces when the self-serve provisioning beta is off.
        if (!isPolicyProvisioned && !isBetaEnabled(CONST.BETAS.IS_TRAVEL_VERIFIED)) {
            if (!isUserValidated) {
                Navigation.navigate(ROUTES.TRAVEL_VERIFY_ACCOUNT.getRoute(undefined, activePolicyID, Navigation.getActiveRoute()));
                return;
            }
            if (shouldShowVerifyAccountModal) {
                showConfirmModal({
                    title: translate('travel.verifyCompany.title'),
                    titleStyles: styles.textHeadlineH1,
                    titleContainerStyles: styles.mb2,
                    prompt: translate('travel.verifyCompany.message'),
                    promptStyles: styles.mb2,
                    confirmText: translate('common.buttonConfirm'),
                    shouldShowCancelButton: false,
                    image: illustrations.RocketDude,
                    imageStyles: StyleUtils.getBackgroundColorStyle(colors.ice600),
                });
            }
            if (!travelSettings?.lastTravelSignupRequestTime) {
                requestTravelAccess();
            }
            return;
        }

        // Hand off to the enablement stepper, which computes and collects only the steps this workspace still needs.
        cleanupTravelProvisioningSession();
        Navigation.navigate(ROUTES.TRAVEL_ENABLE.getRoute(activePolicyID ?? String(CONST.DEFAULT_NUMBER_ID)));
    };

    return (
        <>
            {!shouldRenderErrorMessageBelowButton && !!errorMessage && (
                <DotIndicatorMessage
                    style={styles.mb1}
                    messages={{error: errorMessage}}
                    type="error"
                />
            )}
            <Button
                text={text}
                onPress={bookATrip}
                accessibilityLabel={translate('travel.bookTravel')}
                style={large ? styles.w100 : undefined}
                isDisabled={!activePolicyID}
                success
                large={large}
                sentryLabel={sentryLabel}
            />
            {shouldRenderErrorMessageBelowButton && !!errorMessage && (
                <DotIndicatorMessage
                    style={[styles.mb1, styles.pt3]}
                    messages={{error: errorMessage}}
                    type="error"
                />
            )}
        </>
    );
}

export default BookTravelButton;
