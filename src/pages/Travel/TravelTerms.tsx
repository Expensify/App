import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {Linking, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {buildTravelDotURL} from '@libs/actions/Link';
import {acceptSpotnanaTerms, cleanupTravelProvisioningSession} from '@libs/actions/Travel';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type TravelTermsPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TCS>;

function TravelTerms({route}: TravelTermsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBlockedFromSpotnanaTravel} = usePermissions();
    const [hasAcceptedTravelTerms, setHasAcceptedTravelTerms] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING, {canBeMissing: true});
    const isLoading = travelProvisioning?.isLoading;
    const domain = route.params.domain === CONST.TRAVEL.DEFAULT_DOMAIN ? undefined : route.params.domain;

    useEffect(() => {
        if (travelProvisioning?.error === CONST.TRAVEL.PROVISIONING.ERROR_PERMISSION_DENIED && domain) {
            Navigation.navigate(ROUTES.TRAVEL_DOMAIN_PERMISSION_INFO.getRoute(domain));
            cleanupTravelProvisioningSession();
        }
        if (travelProvisioning?.spotnanaToken) {
            Navigation.closeRHPFlow();
            cleanupTravelProvisioningSession();

            // TravelDot is a standalone white-labeled implementation of Spotnana so it has to be opened in a new tab
            Linking.openURL(buildTravelDotURL(travelProvisioning.spotnanaToken, travelProvisioning.isTestAccount ?? false));
        }
        if (travelProvisioning?.errors && !travelProvisioning?.error) {
            setErrorMessage(getLatestErrorMessage(travelProvisioning));
        }
    }, [travelProvisioning, domain]);

    const toggleTravelTerms = () => {
        setHasAcceptedTravelTerms(!hasAcceptedTravelTerms);
    };

    useEffect(() => {
        if (!hasAcceptedTravelTerms) {
            return;
        }

        setErrorMessage('');
    }, [hasAcceptedTravelTerms]);

    // Add beta support for FullPageNotFound that is universal across travel pages
    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={TravelTerms.displayName}
        >
            <FullPageNotFoundView shouldShow={!CONFIG.IS_HYBRID_APP && isBlockedFromSpotnanaTravel}>
                <HeaderWithBackButton
                    title={translate('travel.termsAndConditions.header')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}>
                    <View style={styles.flex1}>
                        <Text style={styles.headerAnonymousFooter}>{`${translate('travel.termsAndConditions.title')}`}</Text>
                        <View style={[styles.renderHTML, styles.mt4]}>
                            <RenderHTML html={translate('travel.termsAndConditions.subtitle')} />
                        </View>
                        <CheckboxWithLabel
                            style={styles.mt6}
                            accessibilityLabel={translate('travel.termsAndConditions.label')}
                            onInputChange={toggleTravelTerms}
                            label={translate('travel.termsAndConditions.label')}
                        />
                    </View>

                    <FormAlertWithSubmitButton
                        buttonText={translate('common.continue')}
                        isDisabled={!hasAcceptedTravelTerms}
                        onSubmit={() => {
                            if (!hasAcceptedTravelTerms) {
                                setErrorMessage(translate('travel.termsAndConditions.error'));
                                return;
                            }
                            if (errorMessage) {
                                setErrorMessage('');
                            }

                            acceptSpotnanaTerms(domain);
                        }}
                        message={errorMessage}
                        isAlertVisible={!!errorMessage}
                        containerStyles={[styles.mh0, styles.mt5]}
                        isLoading={isLoading}
                    />
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TravelTerms.displayName = 'TravelMenu';

export default TravelTerms;
