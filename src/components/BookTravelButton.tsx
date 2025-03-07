import {Str} from 'expensify-common';
import React, {useCallback, useContext, useState} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {openTravelDotLink} from '@libs/actions/Link';
import {cleanupTravelProvisioningSession} from '@libs/actions/Travel';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getAdminsPrivateEmailDomains, isPaidGroupPolicy} from '@libs/PolicyUtils';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import CustomStatusBarAndBackgroundContext from './CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import DotIndicatorMessage from './DotIndicatorMessage';
import {RocketDude} from './Icon/Illustrations';

type BookTravelButtonProps = {
    text: string;
};

const navigateToAcceptTerms = (domain: string) => {
    // Remove the previous provision session infromation if any is cached.
    cleanupTravelProvisioningSession();
    Navigation.navigate(ROUTES.TRAVEL_TCS.getRoute(domain));
};

function BookTravelButton({text}: BookTravelButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const policy = usePolicy(activePolicyID);
    const [errorMessage, setErrorMessage] = useState('');
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.primaryLogin});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const primaryContactMethod = primaryLogin ?? sessionEmail ?? '';
    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);
    const {isBlockedFromSpotnanaTravel} = usePermissions();
    const [isPreventionModalVisible, setPreventionModalVisibility] = useState(false);

    // Flag indicating whether NewDot was launched exclusively for Travel,
    // e.g., when the user selects "Trips" from the Expensify Classic menu in HybridApp.
    const [wasNewDotLaunchedJustForTravel] = useOnyx(ONYXKEYS.IS_SINGLE_NEW_DOT_ENTRY);

    const hidePreventionModal = () => setPreventionModalVisibility(false);

    const bookATrip = useCallback(() => {
        setErrorMessage('');

        if (isBlockedFromSpotnanaTravel) {
            setPreventionModalVisibility(true);
            return;
        }

        // The primary login of the user is where Spotnana sends the emails with booking confirmations, itinerary etc. It can't be a phone number.
        if (!primaryContactMethod || Str.isSMSLogin(primaryContactMethod)) {
            setErrorMessage(translate('travel.phoneError'));
            return;
        }

        if (!isPaidGroupPolicy(policy)) {
            Navigation.navigate(ROUTES.TRAVEL_UPGRADE);
            return;
        }

        const isPolicyProvisioned = policy?.travelSettings?.spotnanaCompanyID ?? policy?.travelSettings?.associatedTravelDomainAccountID;
        if (policy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned)) {
            openTravelDotLink(policy?.id)
                ?.then(() => {
                    // When a user selects "Trips" in the Expensify Classic menu, the HybridApp opens the ManageTrips page in NewDot.
                    // The wasNewDotLaunchedJustForTravel flag indicates if NewDot was launched solely for this purpose.
                    if (!NativeModules.HybridAppModule || !wasNewDotLaunchedJustForTravel) {
                        return;
                    }

                    // Close NewDot if it was opened only for Travel, as its purpose is now fulfilled.
                    Log.info('[HybridApp] Returning to OldDot after opening TravelDot');
                    NativeModules.HybridAppModule.closeReactNativeApp({shouldSignOut: false, shouldSetNVP: false});
                    setRootStatusBarEnabled(false);
                })
                ?.catch(() => {
                    setErrorMessage(translate('travel.errorMessage'));
                });
        } else if (isPolicyProvisioned) {
            navigateToAcceptTerms(CONST.TRAVEL.DEFAULT_DOMAIN);
        } else {
            // Determine the domain to associate with the workspace during provisioning in Spotnana.
            // - If all admins share the same private domain, the workspace is tied to it automatically.
            // - If admins have multiple private domains, the user must select one.
            // - Public domains are not allowed; an error page is shown in that case.
            const adminDomains = getAdminsPrivateEmailDomains(policy);
            if (adminDomains.length === 0) {
                Navigation.navigate(ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR);
            } else if (isEmptyObject(policy?.address)) {
                // Spotnana requires an address anytime an entity is created for a policy
                Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_ADDRESS.getRoute(policy?.id, Navigation.getActiveRoute()));
            } else if (adminDomains.length === 1) {
                navigateToAcceptTerms(adminDomains.at(0) ?? CONST.TRAVEL.DEFAULT_DOMAIN);
            } else {
                Navigation.navigate(ROUTES.TRAVEL_DOMAIN_SELECTOR);
            }
        }
    }, [policy, wasNewDotLaunchedJustForTravel, travelSettings, translate, primaryContactMethod, setRootStatusBarEnabled, isBlockedFromSpotnanaTravel]);

    return (
        <>
            {!!errorMessage && (
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
        </>
    );
}

BookTravelButton.displayName = 'BookTravelButton';

export default BookTravelButton;
