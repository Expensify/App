import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useStepFormSubmit from '@hooks/useStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SubscriptionSizeForm';

type SizeProps = SubStepProps;

function Size({onNext}: SizeProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const {inputCallbackRef} = useAutoFocusInput();

    const updateValuesAndNavigateToNextStep = useStepFormSubmit<typeof ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM>({
        formId: ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM,
        fieldIds: [INPUT_IDS.SUBSCRIPTION_SIZE],
        onNext,
        shouldSaveDraft: true,
    });

    const defaultValues = {
        [INPUT_IDS.SUBSCRIPTION_SIZE]: `${privateSubscription?.userCount ?? ''}`,
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.SUBSCRIPTION_SIZE]);
            if (values[INPUT_IDS.SUBSCRIPTION_SIZE] && !ValidationUtils.isValidSubscriptionSize(values[INPUT_IDS.SUBSCRIPTION_SIZE])) {
                errors.subscriptionSize = translate('subscription.subscriptionSize.error.size');
            }

            if (Number(values[INPUT_IDS.SUBSCRIPTION_SIZE]) === privateSubscription?.userCount) {
                errors.subscriptionSize = translate('subscription.subscriptionSize.error.sameSize');
            }

            return errors;
        },
        [privateSubscription?.userCount, translate],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM}
            submitButtonText={translate('common.next')}
            onSubmit={updateValuesAndNavigateToNextStep}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
            enabledWhenOffline
        >
            <View>
                <Text style={[styles.textNormalThemeText, styles.mb5]}>{translate('subscription.subscriptionSize.yourSize')}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    ref={inputCallbackRef}
                    inputID={INPUT_IDS.SUBSCRIPTION_SIZE}
                    label={translate('subscription.subscriptionSize.subscriptionSize')}
                    aria-label={translate('subscription.subscriptionSize.subscriptionSize')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={defaultValues[INPUT_IDS.SUBSCRIPTION_SIZE]}
                    shouldSaveDraft
                />
                <Text style={[styles.formHelp, styles.mt2]}>{translate('subscription.subscriptionSize.eachMonth')}</Text>
                <Text style={[styles.formHelp, styles.mt2]}>{translate('subscription.subscriptionSize.note')}</Text>
            </View>
        </FormProvider>
    );
}

Size.displayName = 'SizeStep';

export default Size;
