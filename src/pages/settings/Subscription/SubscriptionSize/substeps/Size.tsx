import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {validate} from '@pages/settings/Subscription/SubscriptionSize/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SubscriptionSizeForm';

type SizeProps = SubStepProps;

function Size({onNext}: SizeProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const defaultValues = {
        // TODO this is temporary and default value will be replaced in next phase once data in ONYX is ready
        [INPUT_IDS.SUBSCRIPTION_SIZE]: '',
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM}
            submitButtonText={translate('common.next')}
            onSubmit={onNext}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
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
