import {Str} from 'expensify-common';
import type {ReactElement} from 'react';
import React, {useCallback, useEffect, useState} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {cleanupTravelProvisioningSession, requestTravelAccess} from '@libs/actions/Travel';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import {getActivePolicies, getAdminsPrivateEmailDomains, isPaidGroupPolicy} from '@libs/PolicyUtils';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import DotIndicatorMessage from './DotIndicatorMessage';
import {RocketDude} from './Icon/Illustrations';
import RenderHTML from './RenderHTML';

type BookTravelButtonProps = {
    text: string;

    /** Whether to render the error message below the button */
    shouldRenderErrorMessageBelowButton?: boolean;

    /** Function to set the shouldScrollToBottom state */
    setShouldScrollToBottom?: (shouldScrollToBottom: boolean) => void;
};

const navigateToAcceptTerms = (domain: string, isUserValidated?: boolean) => {
    // Remove the previous provision session information if any is cached.
    cleanupTravelProvisioningSession();
    if (isUserValidated) {
        Navigation.navigate(ROUTES.TRAVEL_TCS.getRoute(domain));
        return;
    }
    Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute(), ROUTES.TRAVEL_TCS.getRoute(domain)));
};

function BookTravelButton({text, shouldRenderErrorMessageBelowButton = false, setShouldScrollToBottom}: BookTravelButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const phoneErrorMethodsRoute = `${environmentURL}/${ROUTES.SETTINGS_CONTACT_METHODS.getRoute(Navigation.getActiveRoute())}`;
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const isUserValidated = account?.validated ?? false;
    const primaryLogin = account?.primaryLogin ?? '';

    const policy = usePolicy(activePolicyID);
    const [errorMessage, setErrorMessage] = useState<string | ReactElement>('');
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS, {canBeMissing: true});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email, canBeMissing: false});
    const primaryContactMethod = primaryLogin ?? sessionEmail ?? '';
    const {isBlockedFromSpotnanaTravel, isBetaEnabled} = usePermissions();
    const [isPreventionModalVisible, setPreventionModalVisibility] = useState(false);
    const [isVerificationModalVisible, setVerificationModalVisibility] = useState(false);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const activePolicies = getActivePolicies(policies, currentUserLogin);
    const groupPaidPolicies = activePolicies.filter((activePolicy) => activePolicy.type !== CONST.POLICY.TYPE.PERSONAL && isPaidGroupPolicy(activePolicy));

    const hidePreventionModal = () => setPreventionModalVisibility(false);
    const hideVerificationModal = () => setVerificationModalVisibility(false);

    useEffect(() => {
        if (!errorMessage) {
            return;
        }
        setShouldScrollToBottom?.(true);
    }, [errorMessage, setShouldScrollToBottom]);

    const bookATrip = useCallback(() => {
        setErrorMessage('');

        if (isBlockedFromSpotnanaTravel) {
            setPreventionModalVisibility(true);
            return;
        }

        // The primary login of the user is where Spotnana sends the emails with booking confirmations, itinerary etc. It can't be a phone number.
        if (!primaryContactMethod || Str.isSMSLogin(primaryContactMethod)) {
            setErrorMessage(<RenderHTML html={translate('travel.phoneError', {phoneErrorMethodsRoute})} />);
            return;
        }

        const adminDomains = getAdminsPrivateEmailDomains(policy);
        if (adminDomains.length === 0) {
            Navigation.navigate(ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.getRoute(Navigation.getActiveRoute()));
            return;
        }

        if (groupPaidPolicies.length < 1) {
            Navigation.navigate(ROUTES.TRAVEL_UPGRADE.getRoute(Navigation.getActiveRoute()));
            return;
        }

        if (!isPaidGroupPolicy(policy)) {
            setErrorMessage(translate('travel.termsAndConditions.defaultWorkspaceError'));
            return;
        }

        const isPolicyProvisioned = policy?.travelSettings?.spotnanaCompanyID ?? policy?.travelSettings?.associatedTravelDomainAccountID;
        if (policy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned)) {
            openTravelDotLink(policy?.id);
        } else if (isPolicyProvisioned) {
            navigateToAcceptTerms(CONST.TRAVEL.DEFAULT_DOMAIN);
        } else if (!isBetaEnabled(CONST.BETAS.IS_TRAVEL_VERIFIED)) {
            setVerificationModalVisibility(true);
            if (!travelSettings?.lastTravelSignupRequestTime) {
                requestTravelAccess();
            }
        }
        // Determine the domain to associate with the workspace during provisioning in Spotnana.
        // - If all admins share the same private domain, the workspace is tied to it automatically.
        // - If admins have multiple private domains, the user must select one.
        // - Public domains are not allowed; an error page is shown in that case.
        else if (adminDomains.length === 1) {
            const domain = adminDomains.at(0) ?? CONST.TRAVEL.DEFAULT_DOMAIN;
            if (isEmptyObject(policy?.address)) {
                // Spotnana requires an address anytime an entity is created for a policy
                Navigation.navigate(ROUTES.TRAVEL_WORKSPACE_ADDRESS.getRoute(domain, Navigation.getActiveRoute()));
            } else {
                navigateToAcceptTerms(domain, !!isUserValidated);
            }
        } else {
            Navigation.navigate(ROUTES.TRAVEL_DOMAIN_SELECTOR.getRoute(Navigation.getActiveRoute()));
        }
    }, [
        isBlockedFromSpotnanaTravel,
        primaryContactMethod,
        policy,
        groupPaidPolicies.length,
        travelSettings?.hasAcceptedTerms,
        travelSettings?.lastTravelSignupRequestTime,
        isBetaEnabled,
        styles.flexRow,
        StyleUtils,
        translate,
        isUserValidated,
        phoneErrorMethodsRoute,
    ]);

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
                style={styles.w100}
                success
                large
            />
            {shouldRenderErrorMessageBelowButton && !!errorMessage && (
                <DotIndicatorMessage
                    style={[styles.mb1, styles.pt3]}
                    messages={{error: errorMessage}}
                    type="error"
                />
            )}
            <ConfirmModal
                title={translate('travel.blockedFeatureModal.title')}
                titleStyles={styles.textHeadlineH1}
                titleContainerStyles={styles.mb2}
                onConfirm={hidePreventionModal}
                onCancel={hidePreventionModal}
                image={RocketDude}
                imageStyles={StyleUtils.getBackgroundColorStyle(colors.ice600)}
                isVisible={isPreventionModalVisible}
                prompt={translate('travel.blockedFeatureModal.message')}
                promptStyles={styles.mb2}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
            <ConfirmModal
                title={translate('travel.verifyCompany.title')}
                titleStyles={styles.textHeadlineH1}
                titleContainerStyles={styles.mb2}
                onConfirm={hideVerificationModal}
                onCancel={hideVerificationModal}
                image={RocketDude}
                imageStyles={StyleUtils.getBackgroundColorStyle(colors.ice600)}
                isVisible={isVerificationModalVisible}
                prompt={translate('travel.verifyCompany.message')}
                promptStyles={styles.mb2}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </>
    );
}

BookTravelButton.displayName = 'BookTravelButton';

export default BookTravelButton;
