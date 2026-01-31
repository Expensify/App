import type {StackScreenProps} from '@react-navigation/stack';
import Str from 'expensify-common/dist/str';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import ConfirmModal from '@components/ConfirmModal';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {buildTravelDotURL} from '@libs/actions/Link';
import {addComment} from '@libs/actions/Report';
import {acceptSpotnanaTerms, cleanupTravelProvisioningSession} from '@libs/actions/Travel';
import asyncOpenURL from '@libs/asyncOpenURL';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import colors from '@styles/theme/colors';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type TravelTermsPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TCS>;

function TravelTerms({route}: TravelTermsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['RocketDude']);
    const {isBetaEnabled} = usePermissions();
    const isBlockedFromSpotnanaTravel = isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);
    const [hasAcceptedTravelTerms, setHasAcceptedTravelTerms] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showVerifyCompanyModal, setShowVerifyCompanyModal] = useState(false);
    const [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING, {canBeMissing: true});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const isLoading = travelProvisioning?.isLoading;
    const domain = route.params.domain === CONST.TRAVEL.DEFAULT_DOMAIN ? undefined : route.params.domain;
    const policyID = route.params.policyID;

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const [conciergeReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`, {canBeMissing: true});

    const createTravelEnablementIssue = useCallback(() => {
        if (!conciergeReportID) {
            return;
        }

        const message = translate('travel.verifyCompany.conciergeMessage', {domain: Str.extractEmailDomain(account?.primaryLogin ?? '')});

        addComment({report: conciergeReport, notifyReportID: conciergeReportID, ancestors: [], text: message, timezoneParam: CONST.DEFAULT_TIME_ZONE, currentUserAccountID});
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeReportID));
    }, [translate, account?.primaryLogin, conciergeReportID, conciergeReport, currentUserAccountID]);

    useEffect(() => {
        if (travelProvisioning?.error === CONST.TRAVEL.PROVISIONING.ERROR_PERMISSION_DENIED && domain) {
            Navigation.navigate(ROUTES.TRAVEL_DOMAIN_PERMISSION_INFO.getRoute(domain));
            cleanupTravelProvisioningSession();
        }

        if (travelProvisioning?.error === CONST.TRAVEL.PROVISIONING.ERROR_ADDITIONAL_VERIFICATION_REQUIRED) {
            setShowVerifyCompanyModal(true);
        }

        if (travelProvisioning?.spotnanaToken) {
            Navigation.closeRHPFlow();
            cleanupTravelProvisioningSession();
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
        <>
            <ScreenWrapper
                shouldEnableMaxHeight
                testID="TravelTerms"
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

                                asyncOpenURL(
                                    acceptSpotnanaTerms(domain, policyID).then((response) => {
                                        if (response?.jsonCode !== 200) {
                                            return Promise.reject();
                                        }
                                        if (response?.spotnanaToken) {
                                            return buildTravelDotURL(response.spotnanaToken, response.isTestAccount ?? false);
                                        }
                                    }),
                                    (travelDotURL) => travelDotURL ?? '',
                                );
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
                image={illustrations.RocketDude}
                imageStyles={StyleUtils.getBackgroundColorStyle(colors.ice600)}
            />
        </>
    );
}

export default TravelTerms;
