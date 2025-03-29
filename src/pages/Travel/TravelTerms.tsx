import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Linking, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {buildTravelDotURL} from '@libs/actions/Link';
import {acceptSpotnanaTerms, cleanupTravelProvisioningSession} from '@libs/actions/Travel';
import {clearContactMethodErrors, requestValidateCodeAction, validateSecondaryLogin} from '@libs/actions/User';
import {getEarliestErrorField, getLatestErrorField, getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type TravelTermsPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.TCS>;

function TravelTerms({route}: TravelTermsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {canUseSpotnanaTravel, isBlockedFromSpotnanaTravel} = usePermissions();
    const [hasAcceptedTravelTerms, setHasAcceptedTravelTerms] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING);
    const isLoading = travelProvisioning?.isLoading;
    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.validated});
    const [isValidateModalVisible, setIsValidateModalVisible] = useState(!isUserValidated);
    const domain = route.params.domain === CONST.TRAVEL.DEFAULT_DOMAIN ? undefined : route.params.domain;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const contactMethod = account?.primaryLogin ?? '';
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const loginData = useMemo(() => loginList?.[contactMethod], [loginList, contactMethod]);
    const validateLoginError = getEarliestErrorField(loginData, 'validateLogin');
    const hasMagicCodeBeenSent = !!validateCodeAction?.validateCodeSent;

    useEffect(() => {
        setIsValidateModalVisible(!isUserValidated);

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
    }, [travelProvisioning, domain, isUserValidated]);

    useBeforeRemove(() => setIsValidateModalVisible(false));

    const toggleTravelTerms = () => {
        setHasAcceptedTravelTerms(!hasAcceptedTravelTerms);
    };

    useEffect(() => {
        if (!hasAcceptedTravelTerms) {
            return;
        }

        setErrorMessage('');
    }, [hasAcceptedTravelTerms]);

    const AgreeToTheLabel = useCallback(
        () => (
            <Text>
                {`${translate('travel.termsAndConditions.agree')}`}
                <TextLink href={CONST.TRAVEL_TERMS_URL}>{`${translate('travel.termsAndConditions.travelTermsAndConditions')}`}</TextLink>
            </Text>
        ),
        [translate],
    );

    // Add beta support for FullPageNotFound that is universal across travel pages
    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={TravelTerms.displayName}
        >
            <FullPageNotFoundView shouldShow={!CONFIG.IS_HYBRID_APP && (!canUseSpotnanaTravel || isBlockedFromSpotnanaTravel)}>
                <HeaderWithBackButton
                    title={translate('travel.termsAndConditions.header')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}>
                    <View style={styles.flex1}>
                        <Text style={styles.headerAnonymousFooter}>{`${translate('travel.termsAndConditions.title')}`}</Text>
                        <Text style={styles.mt4}>
                            {`${translate('travel.termsAndConditions.subtitle')}`}
                            <TextLink href={CONST.TRAVEL_TERMS_URL}>{`${translate('travel.termsAndConditions.termsconditions')}.`}</TextLink>
                        </Text>
                        <CheckboxWithLabel
                            style={styles.mt6}
                            accessibilityLabel={translate('travel.termsAndConditions.travelTermsAndConditions')}
                            onInputChange={toggleTravelTerms}
                            LabelComponent={AgreeToTheLabel}
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
                <ValidateCodeActionModal
                    title={translate('contacts.validateAccount')}
                    descriptionPrimary={translate('contacts.featureRequiresValidate')}
                    descriptionSecondary={translate('contacts.enterMagicCode', {contactMethod})}
                    isVisible={isValidateModalVisible}
                    hasMagicCodeBeenSent={hasMagicCodeBeenSent}
                    validatePendingAction={loginData?.pendingFields?.validateCodeSent}
                    sendValidateCode={() => requestValidateCodeAction()}
                    handleSubmitForm={(validateCode) => validateSecondaryLogin(loginList, contactMethod, validateCode, true)}
                    validateError={!isEmptyObject(validateLoginError) ? validateLoginError : getLatestErrorField(loginData, 'validateCodeSent')}
                    clearError={() => clearContactMethodErrors(contactMethod, !isEmptyObject(validateLoginError) ? 'validateLogin' : 'validateCodeSent')}
                    onModalHide={() => {}}
                    onClose={() => {
                        setIsValidateModalVisible(false);
                    }}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TravelTerms.displayName = 'TravelMenu';

export default TravelTerms;
