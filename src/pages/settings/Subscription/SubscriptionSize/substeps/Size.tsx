import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
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

    const defaultValues = {
        // TODO get default value from ONYX
        [INPUT_IDS.SUBSCRIPTION_SIZE]: '0',
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
                <Text style={[styles.textNormalThemeText, styles.mb5]}>{translate('subscriptionSize.yourSize')}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.SUBSCRIPTION_SIZE}
                    label={translate('subscriptionSize.subscriptionSize')}
                    aria-label={translate('subscriptionSize.subscriptionSize')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={defaultValues[INPUT_IDS.SUBSCRIPTION_SIZE]}
                    shouldSaveDraft
                />
                <Text style={[styles.textLabel, styles.mt5]}>{translate('subscriptionSize.eachMonth')}</Text>
                <Text style={[styles.textLabel, styles.mt5]}>{translate('subscriptionSize.note')}</Text>
            </View>
        </FormProvider>
    );
}

Size.displayName = 'SizeStep';

export default Size;
