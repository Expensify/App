import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MoneyRequestRejectReasonForm';

type RejectReasonFormViewProps = {
    /** Submit function for submitting form */
    onSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => void;

    /** Submit function for validating form */
    validate: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => Partial<Record<'comment', string | undefined>>;

    /** Link to previous page */
    backTo?: Route;
};

function RejectReasonFormView({backTo, validate, onSubmit}: RejectReasonFormViewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="RejectReasonFormView"
        >
            <HeaderWithBackButton
                title={translate('iou.reject.reasonPageTitle')}
                onBackButtonPress={() => Navigation.goBack(backTo)}
            />
            <FormProvider
                formID="moneyRejectReasonForm"
                submitButtonText={translate('iou.reject.reasonPageTitle')}
                style={[styles.flexGrow1, styles.ph5]}
                onSubmit={onSubmit}
                validate={validate}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                isSubmitActionDangerous
            >
                <View style={styles.mb6}>
                    <Text>{translate('iou.reject.reasonPageDescription')}</Text>
                </View>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.COMMENT}
                        valueType="string"
                        name="comment"
                        defaultValue={undefined}
                        label={translate('iou.reject.rejectReason')}
                        accessibilityLabel={translate('iou.reject.rejectReason')}
                        ref={inputCallbackRef}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

export default RejectReasonFormView;
