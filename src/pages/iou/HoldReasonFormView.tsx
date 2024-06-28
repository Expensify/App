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
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

type HoldReasonFormViewProps = {
    /** Submit function for submitting form */
    onSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => void;

    /** Submit function for validating form */
    validate: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => Partial<Record<'comment', string | undefined>>;

    /** Link to previous page */
    backTo: Route;
};

function HoldReasonFormView({backTo, validate, onSubmit}: HoldReasonFormViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={HoldReasonFormView.displayName}
        >
            <HeaderWithBackButton
                title={translate('iou.holdExpense')}
                onBackButtonPress={() => Navigation.goBack(backTo)}
            />
            <FormProvider
                formID="moneyHoldReasonForm"
                submitButtonText={translate('iou.holdExpense')}
                style={[styles.flexGrow1, styles.ph5]}
                onSubmit={onSubmit}
                validate={validate}
                enabledWhenOffline
            >
                <Text style={styles.mb6}>{translate('iou.explainHold')}</Text>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.COMMENT}
                        valueType="string"
                        name="comment"
                        defaultValue={undefined}
                        label={translate('iou.reason')}
                        accessibilityLabel={translate('iou.reason')}
                        ref={inputCallbackRef}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

HoldReasonFormView.displayName = 'HoldReasonFormViewProps';

export default HoldReasonFormView;
