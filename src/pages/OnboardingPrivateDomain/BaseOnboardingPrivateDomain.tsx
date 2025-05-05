import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {isCurrentUserValidated} from '@libs/UserUtils';
import {clearGetAccessiblePoliciesErrors, getAccessiblePolicies} from '@userActions/Policy/Policy';
import {resendValidateCode} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingPrivateDomainProps} from './types';

function BaseOnboardingPrivateDomain({shouldUseNativeStyles, route}: BaseOnboardingPrivateDomainProps) {
    const [hasMagicCodeBeenSent, setHasMagicCodeBeenSent] = useState(false);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});

    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});

    const [getAccessiblePoliciesAction] = useOnyx(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {canBeMissing: true});
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES, {canBeMissing: true});
    const joinablePoliciesLength = Object.keys(joinablePolicies ?? {}).length;

    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    const email = session?.email ?? '';
    const domain = email.split('@').at(1) ?? '';

    const isValidated = isCurrentUserValidated(loginList);

    const sendValidateCode = useCallback(() => {
        if (!credentials?.login) {
            return;
        }
        resendValidateCode(credentials.login);
    }, [credentials?.login]);

    useEffect(() => {
        if (isValidated) {
            return;
        }
        sendValidateCode();
    }, [sendValidateCode, isValidated]);

    useEffect(() => {
        if (!isValidated || joinablePoliciesLength === 0) {
            return;
        }

        Navigation.navigate(ROUTES.ONBOARDING_WORKSPACES.getRoute(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute()), {forceReplace: true});
    }, [isValidated, joinablePoliciesLength]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID="BaseOnboardingPrivateDomain"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={40}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[styles.flex1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, styles.justifyContentBetween]}>
                <View style={[styles.flexGrow1, styles.mb5]}>
                    <Text style={styles.textHeadlineH1}>{translate('onboarding.peopleYouMayKnow')}</Text>
                    <Text style={[styles.textAlignLeft, styles.mt5]}>{translate('onboarding.workspaceYouMayJoin', {domain, email})}</Text>
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
                        hideSubmitButton
                        validateError={getAccessiblePoliciesAction?.errors}
                        hasMagicCodeBeenSent={hasMagicCodeBeenSent}
                        allowResubmit
                    />
                </View>
                <View style={[styles.mb5]}>
                    <Button
                        success={false}
                        large
                        text={translate('common.skip')}
                        isLoading={getAccessiblePoliciesAction?.loading}
                        onPress={() => Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo))}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

BaseOnboardingPrivateDomain.displayName = 'BaseOnboardingPrivateDomain';

export default BaseOnboardingPrivateDomain;
