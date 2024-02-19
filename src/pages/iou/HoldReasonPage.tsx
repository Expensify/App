import type {RouteProp} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
<<<<<<< HEAD
import type {OnyxFormValuesFields} from '@components/Form/types';
=======
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
>>>>>>> origin/main
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as IOU from '@userActions/IOU';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
<<<<<<< HEAD
=======
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';
>>>>>>> origin/main

type HoldReasonPageRouteParams = {
    /** ID of the transaction the page was opened for */
    transactionID: string;

    /** ID of the report that user is providing hold reason to */
    reportID: string;

    /** Link to previous page */
    backTo: Route;
};

type HoldReasonPageProps = {
    /** Navigation route context info provided by react navigation */
    route: RouteProp<{params: HoldReasonPageRouteParams}>;
};

function HoldReasonPage({route}: HoldReasonPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {transactionID, reportID, backTo} = route.params;

    const navigateBack = () => {
        Navigation.navigate(backTo);
    };

<<<<<<< HEAD
    const onSubmit = (values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
=======
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
>>>>>>> origin/main
        IOU.putOnHold(transactionID, values.comment, reportID);
        navigateBack();
    };

<<<<<<< HEAD
    const validate = useCallback((values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
        const requiredFields = ['comment'];
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);
=======
    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM> = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);
>>>>>>> origin/main

        if (!values.comment) {
            errors.comment = 'common.error.fieldRequired';
        }

        return errors;
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={HoldReasonPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('iou.holdRequest')}
                onBackButtonPress={navigateBack}
            />
            <FormProvider
                formID="moneyHoldReasonForm"
                submitButtonText={translate('iou.holdRequest')}
                style={[styles.flexGrow1, styles.ph5]}
                onSubmit={onSubmit}
                validate={validate}
                enabledWhenOffline
            >
                <Text style={[styles.textHeadline, styles.mb6]}>{translate('iou.explainHold')}</Text>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
<<<<<<< HEAD
                        inputID="comment"
=======
                        inputID={INPUT_IDS.COMMENT}
>>>>>>> origin/main
                        valueType="string"
                        name="comment"
                        defaultValue={undefined}
                        label="Reason"
                        accessibilityLabel={translate('iou.reason')}
                        autoFocus
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

HoldReasonPage.displayName = 'MoneyRequestHoldReasonPage';

export default HoldReasonPage;
