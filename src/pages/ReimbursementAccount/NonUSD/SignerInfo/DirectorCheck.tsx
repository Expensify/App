import React, {useMemo, useState} from 'react';
import FormProvider from '@components/Form/FormProvider';
import type {Choice} from '@components/RadioButtons';
import RadioButtons from '@components/RadioButtons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type DirectorCheckProps = {
    /** The title of the question */
    title: string;

    /** The default value of the radio button */
    defaultValue: boolean;

    /** Callback when the value is selected */
    onSelectedValue: (value: boolean) => void;
};

function DirectorCheck({title, onSelectedValue, defaultValue}: DirectorCheckProps) {
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
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{title}</Text>
            <Text style={[styles.pv3, styles.textSupporting]}>{translate('signerInfoStep.regulationRequiresUs')}</Text>
            <RadioButtons
                items={options}
                onPress={handleSelectValue}
                defaultCheckedValue={defaultValue.toString()}
                radioButtonStyle={[styles.mb6]}
            />
        </FormProvider>
    );
}

DirectorCheck.displayName = 'DirectorCheck';

export default DirectorCheck;
