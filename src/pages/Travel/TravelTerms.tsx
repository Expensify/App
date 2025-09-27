import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {Linking, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import ConfirmModal from '@components/ConfirmModal';
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
import * as Report from '@libs/actions/Report';
import {acceptSpotnanaTerms, cleanupTravelProvisioningSession} from '@libs/actions/Travel';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import { addComment } from '@libs/actions/Report';
import {RocketDude} from '@components/Icon/Illustrations';
import useStyleUtils from '@hooks/useStyleUtils';
import colors from '@styles/theme/colors';

type TravelTermsPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TCS>;

function TravelTerms({route}: TravelTermsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const {isBetaEnabled} = usePermissions();
    const isBlockedFromSpotnanaTravel = isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);
    const [hasAcceptedTravelTerms, setHasAcceptedTravelTerms] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showVerifyCompanyModal, setShowVerifyCompanyModal] = useState(false);
    let [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING, {canBeMissing: true});

    const isLoading = travelProvisioning?.isLoading;
    const domain = route.params.domain === CONST.TRAVEL.DEFAULT_DOMAIN ? undefined : route.params.domain;

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const createTravelEnablementIssue = useCallback(() => {
        const message = translate('travel.verifyCompany.conciergeMessage', {domain: account?.primaryLogin?.split('@')[1] || ''});
        
        if (conciergeReportID) {
            // If we have the Concierge report ID, add the comment directly
            addComment(conciergeReportID, message, CONST.DEFAULT_TIME_ZONE);
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeReportID));
        } else {
            // If we don't have the Concierge report ID yet, navigate to create it first
            Report.navigateToConciergeChat();
        }
    }, [translate, account?.primaryLogin, conciergeReportID]);

    useEffect(() => {
        if (travelProvisioning?.error === CONST.TRAVEL.PROVISIONING.ERROR_PERMISSION_DENIED && domain) {
            Navigation.navigate(ROUTES.TRAVEL_DOMAIN_PERMISSION_INFO.getRoute(domain));
            cleanupTravelProvisioningSession();
        }

        if (travelProvisioning?.error === CONST.TRAVEL.PROVISIONING.ERROR_TRAVEL_ENABLEMENT_FAILED) {
            setShowVerifyCompanyModal(true);
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
    }, [travelProvisioning, domain, setShowVerifyCompanyModal]);

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
        <>
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
            
            <ConfirmModal
                isVisible={showVerifyCompanyModal}
                onConfirm={() => {
                    createTravelEnablementIssue();
                    setShowVerifyCompanyModal(false);
                }}
                onCancel={() => {
                    setShowVerifyCompanyModal(false);
                }}
                title={translate('travel.verifyCompany.title')}
                titleStyles={styles.textHeadlineH1}
                titleContainerStyles={styles.mb2}
                prompt={translate('travel.verifyCompany.message')}
                promptStyles={styles.mb2}
                confirmText={translate('travel.verifyCompany.confirmText')}
                shouldShowCancelButton={false}
                image={RocketDude}
                imageStyles={StyleUtils.getBackgroundColorStyle(colors.ice600)}
            />
        </>
    );
}

TravelTerms.displayName = 'TravelMenu';

export default TravelTerms;
