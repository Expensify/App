import RadioButtons from '@components/RadioButtons';

import useLocalize from '@hooks/useLocalize';

import React from 'react';

const YES = 'yes';
const NO = 'no';

type YesNoAdapterProps = {
    /** Answer supplied by the FormProvider. The empty string means unanswered. */
    value?: boolean | '';

    /** Callback to update the answer in the FormProvider */
    onInputChange?: (value: boolean) => void;

    errorText?: string;
};

/** A boolean asked as a Yes/No question, for a boolean that is alone on its page */
function YesNoAdapter({value, onInputChange = () => {}, errorText}: YesNoAdapterProps) {
    const {translate} = useLocalize();
    let checkedValue = '';
    if (value === true) {
        checkedValue = YES;
    } else if (value === false) {
        checkedValue = NO;
    }

    return (
        <RadioButtons
            items={[
                {label: translate('common.yes'), value: YES},
                {label: translate('common.no'), value: NO},
            ]}
            value={checkedValue}
            onInputChange={(choice) => onInputChange(choice === YES)}
            errorText={errorText}
        />
    );
}

export default YesNoAdapter;
