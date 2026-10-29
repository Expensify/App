import FormProvider from '@components/Form/FormProvider';
import FormHeader from '@components/Form/Layout/FormHeader';
import FormMenuRows from '@components/Form/Layout/FormMenuRows';
import type {Choice} from '@components/RadioButtons';
import RadioButtons from '@components/RadioButtons';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';

type YesNoStepProps = {
    /** The title of the question */
    title: string;

    /** The description of the question */
    description: string;

    /** The default value of the radio button */
    defaultValue: boolean;

    onSelectedValue: (value: boolean) => void;
    submitButtonStyles?: StyleProp<ViewStyle>;

    /** Whether the submit button should be flex enabled, allowing it to grow and fill available space */
    submitFlexEnabled?: boolean;

    /** Indicates if button should be in isLoading state */
    isLoading?: boolean;

    /** Optional content rendered below the radio buttons */
    children?: React.ReactNode;

    /** Optional callback fired when the radio selection changes */
    onValueChange?: () => void;
};

function YesNoStep({title, description, defaultValue, onSelectedValue, submitButtonStyles, submitFlexEnabled, isLoading = false, children, onValueChange}: YesNoStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(defaultValue);

    const handleSubmit = () => {
        onSelectedValue(value);
    };

    const handleSelectValue = (newValue: string) => {
        setValue(newValue === 'true');
        onValueChange?.();
    };

    const options: Choice[] = [
        {
            label: translate('common.yes'),
            value: 'true',
        },
        {
            label: translate('common.no'),
            value: 'false',
        },
    ];

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate('common.confirm')}
            onSubmit={handleSubmit}
            style={styles.flexGrow1}
            submitButtonStyles={[submitButtonStyles, styles.mh5]}
            submitFlexEnabled={submitFlexEnabled}
            isLoading={isLoading}
            shouldHideFixErrorsAlert
        >
            <FormHeader
                title={title}
                description={description}
                style={styles.mh5}
            />
            <FormMenuRows>
                <RadioButtons
                    items={options}
                    onSelect={handleSelectValue}
                    defaultCheckedValue={defaultValue.toString()}
                />
            </FormMenuRows>
            {children}
        </FormProvider>
    );
}

export default YesNoStep;
