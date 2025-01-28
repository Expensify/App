import {Str} from 'expensify-common';
import React, {useCallback, useState} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {openTravelDotLink} from '@libs/actions/Link';
import {cleanupTravelProvisioningSession} from '@libs/actions/Travel';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getAdminsPrivateEmailDomains} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Button from './Button';
import DotIndicatorMessage from './DotIndicatorMessage';

type BookTravelButtonProps = {
    text: string;
};

function BookTravelButton({text}: BookTravelButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const policy = usePolicy(activePolicyID);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSingleNewDotEntry] = useOnyx(ONYXKEYS.IS_SINGLE_NEW_DOT_ENTRY);
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const primaryLogin = account?.primaryLogin;

    const bookATrip = useCallback(() => {
        if (!primaryLogin || Str.isSMSLogin(primaryLogin)) {
            setErrorMessage(translate('travel.phoneError'));
            return;
        }

        if (isEmptyObject(policy?.address)) {
            Navigation.navigate(ROUTES.WORKSPACE_PROFILE_ADDRESS.getRoute(policy?.id, Navigation.getActiveRoute()));
            return;
        }

        const isPolicyProvisioned = policy?.travelSettings?.spotnanaCompanyID ?? policy?.travelSettings?.associatedTravelDomainAccountID;
        if (policy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned)) {
            openTravelDotLink(policy?.id)
                ?.then(() => {
                    if (!NativeModules.HybridAppModule || !isSingleNewDotEntry) {
                        return;
                    }

                    Log.info('[HybridApp] Returning to OldDot after opening TravelDot');
                    NativeModules.HybridAppModule.closeReactNativeApp(false, false);
                })
                ?.catch(() => {
                    setErrorMessage(translate('travel.errorMessage'));
                });
            if (errorMessage) {
                setErrorMessage('');
            }
        } else if (isPolicyProvisioned) {
            cleanupTravelProvisioningSession();
            Navigation.navigate(ROUTES.TRAVEL_TCS.getRoute(CONST.TRAVEL.DEFAULT_DOMAIN));
        } else {
            const adminDomains = getAdminsPrivateEmailDomains(policy);
            let routeToNavigateTo;
            if (adminDomains.length === 0) {
                routeToNavigateTo = ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR;
            } else if (adminDomains.length === 1) {
                cleanupTravelProvisioningSession();
                routeToNavigateTo = ROUTES.TRAVEL_TCS.getRoute(adminDomains.at(0) ?? CONST.TRAVEL.DEFAULT_DOMAIN);
            } else {
                routeToNavigateTo = ROUTES.TRAVEL_DOMAIN_SELECTOR;
            }
            Navigation.navigate(routeToNavigateTo);
        }
    }, [policy, isSingleNewDotEntry, travelSettings, translate, errorMessage, primaryLogin]);

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
        </>
    );
}

BookTravelButton.displayName = 'BookTravelButton';

export default BookTravelButton;
