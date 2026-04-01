import React, {useMemo, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import type {Choice} from '@components/RadioButtons';
import RadioButtons from '@components/RadioButtons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type YesNoStepProps = {
    /** The title of the question */
    title: string;

    /** The description of the question */
    description: string;

    /** The default value of the radio button */
    defaultValue: boolean;

    /** Callback when the value is selected */
    onSelectedValue: (value: boolean) => void;

    /** The style of the submit button */
    submitButtonStyles?: StyleProp<ViewStyle>;

    /** Indicates if button should be in isLoading state */
    isLoading?: boolean;
};

function YesNoStep({title, description, defaultValue, onSelectedValue, submitButtonStyles, isLoading = false}: YesNoStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(defaultValue);

    const handleSubmit = () => {
        onSelectedValue(value);
    };
    const handleSelectValue = (newValue: string) => setValue(newValue === 'true');
    const options = useMemo<Choice[]>(
        () => [
            {
                label: translate('common.yes'),
                value: 'true',
            },
            {
                label: translate('common.no'),
                value: 'false',
            },
        ],
        [translate],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate('common.confirm')}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={submitButtonStyles}
            isLoading={isLoading}
            shouldHideFixErrorsAlert
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{title}</Text>
            <Text style={[styles.pv3, styles.textSupporting]}>{description}</Text>
            <RadioButtons
                items={options}
                onPress={handleSelectValue}
                defaultCheckedValue={defaultValue.toString()}
                radioButtonStyle={[styles.mb6]}
            />
        </FormProvider>
    );
}

export default YesNoStep;
