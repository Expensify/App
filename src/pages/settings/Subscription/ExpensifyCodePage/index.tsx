import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues, clearErrorFields} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {applyExpensifyCode} from '@userActions/Subscription';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SubscriptionExpensifyCodeForm';

function ExpensifyCodePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [subscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {canBeMissing: true});
    const isExpensifyCodeApplied = !!subscription?.expensifyCode;

    const defaultValues = {
        [INPUT_IDS.EXPENSIFY_CODE]: '',
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM> => {
            return getFieldRequiredErrors(values, [INPUT_IDS.EXPENSIFY_CODE], translate);
        },
        [translate],
    );

    const handleSubmit = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM>) => {
        const expensifyCode = values[INPUT_IDS.EXPENSIFY_CODE];
        applyExpensifyCode(expensifyCode);
        clearDraftValues(ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM);
        setHasSubmitted(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            clearErrorFields(ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM);
        }, []),
    );

    useEffect(() => {
        if (!hasSubmitted || !isExpensifyCodeApplied) {
            return;
        }
        Navigation.goBack();
    }, [hasSubmitted, isExpensifyCodeApplied]);

    if (isExpensifyCodeApplied || subscription?.isSecretPromoCode) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID={ExpensifyCodePage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldEnableMaxHeight
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('subscription.expensifyCode.title')}
                    onBackButtonPress={Navigation.goBack}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM}
                    submitButtonText={translate('subscription.expensifyCode.apply')}
                    onSubmit={handleSubmit}
                    validate={validate}
                    style={[styles.mh5, styles.flexGrow1]}
                    shouldHideFixErrorsAlert
                >
                    <View>
                        <Text style={[styles.textNormalThemeText, styles.mb5]}>{translate('subscription.expensifyCode.enterCode')}</Text>
                        <InputWrapper
                            InputComponent={TextInput}
                            ref={inputCallbackRef}
                            inputID={INPUT_IDS.EXPENSIFY_CODE}
                            label={translate('subscription.expensifyCode.discountCode')}
                            aria-label={translate('subscription.expensifyCode.discountCode')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={defaultValues[INPUT_IDS.EXPENSIFY_CODE]}
                            shouldSaveDraft
                            autoCapitalize="none"
                            testID="expensify-code-input"
                        />
                    </View>
                </FormProvider>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

ExpensifyCodePage.displayName = 'ExpensifyCodePage';

export default ExpensifyCodePage;
