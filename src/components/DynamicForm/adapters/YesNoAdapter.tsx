import RadioButtons from '@components/RadioButtons';

import useLocalize from '@hooks/useLocalize';

import React from 'react';

const YES = 'yes';
const NO = 'no';

type YesNoAdapterProps = {
    /** The empty string means unanswered */
    value?: boolean | '';

    onInputChange?: (value: boolean) => void;

    errorText?: string;
};

/** A boolean asked as a Yes/No question, where No is an answer too */
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
