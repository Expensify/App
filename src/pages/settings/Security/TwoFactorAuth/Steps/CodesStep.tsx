import {useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {READ_COMMANDS} from '@libs/API/types';
import Clipboard from '@libs/Clipboard';
import * as ErrorUtils from '@libs/ErrorUtils';
import localFileDownload from '@libs/localFileDownload';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {BackToParams, SettingsNavigatorParamList} from '@libs/Navigation/types';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import * as Session from '@userActions/Session';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type CodesStepProps = BackToParams;

function CodesStep({backTo}: CodesStepProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use correct style
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isExtraSmallScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [error, setError] = useState('');

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [user] = useOnyx(ONYXKEYS.USER);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    const isUserValidated = user?.validated;
    const contactMethod = account?.primaryLogin ?? '';
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.TWO_FACTOR_AUTH>>();

    const loginData = useMemo(() => loginList?.[contactMethod], [loginList, contactMethod]);
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');
    const hasMagicCodeBeenSent = !!validateCodeAction?.validateCodeSent;

    const [isValidateModalVisible, setIsValidateModalVisible] = useState(!isUserValidated);

    const {setStep} = useTwoFactorAuthContext();

    useEffect(() => {
        setIsValidateModalVisible(!isUserValidated);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (account?.requiresTwoFactorAuth || account?.recoveryCodes || !isUserValidated) {
            return;
        }
        Session.toggleTwoFactorAuth(true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We want to run this when component mounts
    }, [isUserValidated]);

    useBeforeRemove(() => setIsValidateModalVisible(false));

    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
            shouldEnableKeyboardAvoidingView={false}
            stepCounter={{
                step: 1,
                text: translate('twoFactorAuth.stepCodes'),
                total: 3,
            }}
            // When the 2FA code step is open from Xero flow, we don't need to pass backTo because we build the necessary root route
            // from the backTo param in the route (in getMatchingRootRouteForRHPRoute) and goBack will not need a fallbackRoute.
            onBackButtonPress={() => TwoFactorAuthActions.quitAndNavigateBack(route?.params?.forwardTo?.includes(READ_COMMANDS.CONNECT_POLICY_TO_XERO) ? '' : backTo)}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                {!!isUserValidated && (
                    <Section
                        title={translate('twoFactorAuth.keepCodesSafe')}
                        icon={Illustrations.ShieldYellow}
                        containerStyles={[styles.twoFactorAuthSection]}
                        iconContainerStyles={[styles.ml6]}
                    >
                        <View style={styles.mv3}>
                            <Text>{translate('twoFactorAuth.codesLoseAccess')}</Text>
                        </View>
                        <View style={styles.twoFactorAuthCodesBox({isExtraSmallScreenWidth, isSmallScreenWidth})}>
                            {account?.isLoading ? (
                                <View style={styles.twoFactorLoadingContainer}>
                                    <ActivityIndicator color={theme.spinner} />
                                </View>
                            ) : (
                                <>
                                    <View style={styles.twoFactorAuthCodesContainer}>
                                        {!!account?.recoveryCodes &&
                                            account?.recoveryCodes?.split(', ').map((code) => (
                                                <Text
                                                    style={styles.twoFactorAuthCode}
                                                    key={code}
                                                >
                                                    {code}
                                                </Text>
                                            ))}
                                    </View>
                                    <View style={styles.twoFactorAuthCodesButtonsContainer}>
                                        <PressableWithDelayToggle
                                            text={translate('twoFactorAuth.copy')}
                                            textChecked={translate('common.copied')}
                                            icon={Expensicons.Copy}
                                            inline={false}
                                            onPress={() => {
                                                Clipboard.setString(account?.recoveryCodes ?? '');
                                                setError('');
                                                TwoFactorAuthActions.setCodesAreCopied();
                                            }}
                                            styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                                            textStyles={[styles.buttonMediumText]}
                                            accessible={false}
                                            tooltipText=""
                                            tooltipTextChecked=""
                                        />
                                        <PressableWithDelayToggle
                                            text={translate('common.download')}
                                            icon={Expensicons.Download}
                                            onPress={() => {
                                                localFileDownload('two-factor-auth-codes', account?.recoveryCodes ?? '');
                                                setError('');
                                                TwoFactorAuthActions.setCodesAreCopied();
                                            }}
                                            inline={false}
                                            styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                                            textStyles={[styles.buttonMediumText]}
                                            accessible={false}
                                            tooltipText=""
                                            tooltipTextChecked=""
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    </Section>
                )}
                <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                    {!!error && (
                        <FormHelpMessage
                            isError
                            message={error}
                            style={[styles.mb3]}
                        />
                    )}
                    <Button
                        success
                        large
                        isDisabled={!isUserValidated}
                        text={translate('common.next')}
                        onPress={() => {
                            if (!account?.codesAreCopied) {
                                setError(translate('twoFactorAuth.errorStepCodes'));
                                return;
                            }
                            setStep(CONST.TWO_FACTOR_AUTH_STEPS.VERIFY);
                        }}
                    />
                </FixedFooter>
            </ScrollView>
            <ValidateCodeActionModal
                title={translate('contacts.validateAccount')}
                descriptionPrimary={translate('contacts.featureRequiresValidate')}
                descriptionSecondary={translate('contacts.enterMagicCode', {contactMethod})}
                isVisible={isValidateModalVisible}
                hasMagicCodeBeenSent={hasMagicCodeBeenSent}
                validatePendingAction={loginData?.pendingFields?.validateCodeSent}
                sendValidateCode={() => User.requestValidateCodeAction()}
                handleSubmitForm={(validateCode) => User.validateSecondaryLogin(loginList, contactMethod, validateCode, true)}
                validateError={!isEmptyObject(validateLoginError) ? validateLoginError : ErrorUtils.getLatestErrorField(loginData, 'validateCodeSent')}
                clearError={() => User.clearContactMethodErrors(contactMethod, !isEmptyObject(validateLoginError) ? 'validateLogin' : 'validateCodeSent')}
                onModalHide={() => {}}
                onClose={() => {
                    setIsValidateModalVisible(false);
                    TwoFactorAuthActions.quitAndNavigateBack(backTo);
                }}
            />
        </StepWrapper>
    );
}

CodesStep.displayName = 'CodesStep';

export default CodesStep;
