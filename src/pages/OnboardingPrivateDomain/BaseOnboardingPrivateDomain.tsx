import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnboardingStepCounter from '@hooks/useOnboardingStepCounter';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateOnboardingValuesAndNavigation} from '@libs/actions/Welcome';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isCurrentUserValidated} from '@libs/UserUtils';
import {clearGetAccessiblePoliciesErrors, getAccessiblePolicies} from '@userActions/Policy/Policy';
import {resendValidateCode} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {BaseOnboardingPrivateDomainProps} from './types';

function BaseOnboardingPrivateDomain({shouldUseNativeStyles}: BaseOnboardingPrivateDomainProps) {
    const [hasMagicCodeBeenSent, setHasMagicCodeBeenSent] = useState(false);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const [getAccessiblePoliciesAction] = useOnyx(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES);
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES);
    const joinablePoliciesLength = Object.keys(joinablePolicies ?? {}).length;

    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const onboardingStep = useOnboardingStepCounter(SCREENS.ONBOARDING.DYNAMIC_PRIVATE_DOMAIN);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.ONBOARDING_PRIVATE_DOMAIN.path);

    const email = session?.email ?? '';
    const domain = email.split('@').at(1) ?? '';

    const isValidated = isCurrentUserValidated(loginList, session?.email);

    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isVsb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;

    const sendValidateCode = useCallback(() => {
        if (!email) {
            return;
        }
        resendValidateCode(email);
    }, [email]);

    const handleBackButtonPress = useCallback(() => {
        if (onboardingValues?.shouldValidate === false) {
            updateOnboardingValuesAndNavigation(onboardingValues);
            return;
        }

        Navigation.goBack(backPath);
    }, [backPath, onboardingValues]);

    useEffect(() => {
        if (isValidated) {
            return;
        }
        sendValidateCode();
    }, [sendValidateCode, isValidated]);

    useEffect(() => {
        if (!isValidated) {
            return;
        }

        if (joinablePoliciesLength > 0) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ONBOARDING_WORKSPACES.path), {forceReplace: true});
            return;
        }

        // When validation succeeded but there are no joinable workspaces and the API call has completed,
        // navigate to the next onboarding step (same as the skip button behavior).
        if (getAccessiblePoliciesAction?.loading === false) {
            if (isVsb) {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ONBOARDING_ACCOUNTING.path), {forceReplace: true});
                return;
            }
            if (isSmb) {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ONBOARDING_EMPLOYEES.path), {forceReplace: true});
                return;
            }
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ONBOARDING_PURPOSE.path), {forceReplace: true});
        }
    }, [isValidated, joinablePoliciesLength, getAccessiblePoliciesAction?.loading, isVsb, isSmb, backPath]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID="BaseOnboardingPrivateDomain"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                stepCounter={onboardingStep?.stepCounter}
                progressBarPercentage={onboardingStep?.progressBarPercentage}
                onBackButtonPress={handleBackButtonPress}
                shouldDisplayHelpButton={false}
            />
            <ScrollView
                style={[styles.w100, styles.h100, styles.flex1]}
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, styles.flex1]}>
                    <Text
                        style={styles.textHeadlineH1}
                        accessibilityRole={CONST.ROLE.HEADER}
                    >
                        {translate('onboarding.peopleYouMayKnow')}
                    </Text>
                    <Text style={[styles.textAlignLeft, styles.mv5]}>{translate('onboarding.workspaceYouMayJoin', domain, email)}</Text>
                    <ValidateCodeForm
                        validateCodeActionErrorField="getAccessiblePolicies"
                        handleSubmitForm={(code) => {
                            getAccessiblePolicies(code);
                            setHasMagicCodeBeenSent(false);
                        }}
                        sendValidateCode={() => {
                            sendValidateCode();
                            setHasMagicCodeBeenSent(true);
                        }}
                        clearError={() => clearGetAccessiblePoliciesErrors()}
                        validateError={getAccessiblePoliciesAction?.errors}
                        hasMagicCodeBeenSent={hasMagicCodeBeenSent}
                        shouldShowSkipButton
                        handleSkipButtonPress={() => {
                            if (isVsb) {
                                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ONBOARDING_ACCOUNTING.path));
                                return;
                            }

                            if (isSmb) {
                                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ONBOARDING_EMPLOYEES.path));
                                return;
                            }
                            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ONBOARDING_PURPOSE.path));
                        }}
                        buttonStyles={[styles.flex2, styles.justifyContentEnd]}
                        isLoading={getAccessiblePoliciesAction?.loading}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default BaseOnboardingPrivateDomain;
