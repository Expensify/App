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
import INPUT_IDS from '@src/types/form/MoneyRequestDeclineReasonForm';

type DeclineReasonFormViewProps = {
    /** Submit function for submitting form */
    onSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => void;

    /** Submit function for validating form */
    validate: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => Partial<Record<'comment', string | undefined>>;

    /** Link to previous page */
    backTo: Route;
};

function DeclineReasonFormView({backTo, validate, onSubmit}: DeclineReasonFormViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={DeclineReasonFormView.displayName}
        >
            <HeaderWithBackButton
                title={translate('iou.decline.reasonPageTitle')}
                onBackButtonPress={() => Navigation.goBack(backTo)}
            />
            <FormProvider
                formID="moneyDeclineReasonForm"
                submitButtonText={translate('iou.decline.reasonPageTitle')}
                style={[styles.flexGrow1, styles.ph5]}
                onSubmit={onSubmit}
                validate={validate}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                isSubmitActionDangerous
            >
                <View>
                    <Text style={styles.mb6}>{translate('iou.decline.reasonPageDescription1')}</Text>
                    <Text style={styles.mb6}>{translate('iou.decline.reasonPageDescription2')}</Text>
                </View>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.COMMENT}
                        valueType="string"
                        name="comment"
                        defaultValue={undefined}
                        label={translate('iou.decline.reasonPageTitle')}
                        accessibilityLabel={translate('iou.decline.reasonPageTitle')}
                        ref={inputCallbackRef}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

DeclineReasonFormView.displayName = 'DeclineReasonFormView';

export default DeclineReasonFormView;
