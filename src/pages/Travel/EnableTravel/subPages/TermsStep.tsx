import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {addComment} from '@libs/actions/Report';
import {acceptSpotnanaTerms, cleanupTravelProvisioningSession} from '@libs/actions/Travel';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';

import type {EnableTravelSubPageProps} from '@pages/Travel/EnableTravel/types';

import colors from '@styles/theme/colors';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import Str from 'expensify-common/dist/str';
import React, {useState} from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

/** Safely reads the provisioning error code from an onyxData update value without asserting its type. */
function getProvisioningErrorCode(value: unknown): string | undefined {
    if (typeof value !== 'object' || value === null || !('error' in value)) {
        return undefined;
    }
    const {error} = value;
    return typeof error === 'string' ? error : undefined;
}

function TermsStep({policyID, resolvedDomain}: EnableTravelSubPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['RocketDude']);
    const {isBetaEnabled} = usePermissions();
    const isBlockedFromSpotnanaTravel = isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);
    const [hasAcceptedTravelTerms, setHasAcceptedTravelTerms] = useState(false);
    const [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const delegateAccountID = useDelegateAccountID();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const errorMessage = travelProvisioning?.errors && !travelProvisioning?.error ? getLatestErrorMessage(travelProvisioning) : '';
    const isLoading = travelProvisioning?.isLoading;
    const domain = resolvedDomain === CONST.TRAVEL.DEFAULT_DOMAIN ? undefined : resolvedDomain;

    const createTravelEnablementIssue = () => {
        if (!conciergeReportID) {
            return;
        }

        const message = translate('travel.verifyCompany.conciergeMessage', {domain: Str.extractEmailDomain(account?.primaryLogin ?? '')});

        addComment({
            report: conciergeReport,
            notifyReportID: conciergeReportID,
            ancestors: [],
            text: message,
            timezoneParam: CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID,
            delegateAccountID,
        });
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeReportID));
    };

    const acceptTermsAndOpenTravelDot = () => {
        acceptSpotnanaTerms(domain, policyID, travelProvisioning?.taxID)
            .then((response) => {
                // Extract the error code from onyxData - the backend sets errors in TRAVEL_PROVISIONING via onyxData
                const travelProvisioningData = response?.onyxData?.find((data) => data.key === ONYXKEYS.TRAVEL_PROVISIONING);
                const errorCode = getProvisioningErrorCode(travelProvisioningData?.value);

                // Handle permission denied error
                if (errorCode === CONST.TRAVEL.PROVISIONING.ERROR_PERMISSION_DENIED && domain) {
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRAVEL_DOMAIN_PERMISSION_INFO.path));
                    cleanupTravelProvisioningSession();
                    return Promise.reject(new Error('Permission denied'));
                }

                // Handle verification required error - show modal and reject to close Safari window if open
                if (errorCode === CONST.TRAVEL.PROVISIONING.ERROR_ADDITIONAL_VERIFICATION_REQUIRED) {
                    showConfirmModal({
                        title: translate('travel.verifyCompany.title'),
                        titleStyles: styles.textHeadlineH1,
                        titleContainerStyles: styles.mb2,
                        prompt: translate('travel.verifyCompany.message'),
                        promptStyles: styles.mb2,
                        confirmText: translate('travel.verifyCompany.confirmText'),
                        shouldShowCancelButton: false,
                        image: illustrations.RocketDude,
                        imageStyles: StyleUtils.getBackgroundColorStyle(colors.ice600),
                        // Disable browser history handling since we handle navigation ourselves
                        shouldHandleNavigationBack: false,
                    }).then((result) => {
                        // Only navigate to concierge on confirm, on backdrop just close modal (TermsStep stays visible)
                        if (result.action !== ModalActions.CONFIRM) {
                            return;
                        }
                        createTravelEnablementIssue();
                    });
                    return Promise.reject(new Error('Verification required'));
                }

                // Handle general API failure
                if (response?.jsonCode !== 200) {
                    return Promise.reject(new Error('Request failed'));
                }

                // Handle success - open travel in-app webview on native, or in browser on web
                if (response?.spotnanaToken) {
                    Navigation.closeRHPFlow();
                    cleanupTravelProvisioningSession();
                    openTravelDotLink(policyID, undefined, response.spotnanaToken, response.isTestAccount ?? false);
                    return;
                }

                return Promise.reject(new Error('No token received'));
            })
            .catch(() => {
                // Errors are surfaced via TRAVEL_PROVISIONING in Onyx
            });
    };

    return (
        <FullPageNotFoundView shouldShow={!CONFIG.IS_HYBRID_APP && isBlockedFromSpotnanaTravel}>
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}>
                <View style={styles.flex1}>
                    <Text style={styles.headerAnonymousFooter}>{`${translate('travel.termsAndConditions.title')}`}</Text>
                    <View style={[styles.renderHTML, styles.mt4]}>
                        <RenderHTML html={translate('travel.termsAndConditions.subtitle')} />
                    </View>
                    <CheckboxWithLabel
                        style={styles.mt6}
                        accessibilityLabel={translate('travel.termsAndConditions.label')}
                        onInputChange={() => setHasAcceptedTravelTerms((prev) => !prev)}
                        label={translate('travel.termsAndConditions.label')}
                    />
                </View>
                <FormAlertWithSubmitButton
                    buttonText={translate('common.continue')}
                    isDisabled={!hasAcceptedTravelTerms}
                    onSubmit={acceptTermsAndOpenTravelDot}
                    message={errorMessage}
                    isAlertVisible={!!errorMessage}
                    containerStyles={[styles.mh0, styles.mt5]}
                    isLoading={isLoading}
                />
            </ScrollView>
        </FullPageNotFoundView>
    );
}

export default TermsStep;
