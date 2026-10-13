import RadioButtons from '@components/RadioButtons';

import useLocalize from '@hooks/useLocalize';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import React from 'react';

const YES = 'yes';
const NO = 'no';

type YesNoAdapterProps = ForwardedFSClassProps & {
    /** The empty string means unanswered */
    value?: boolean | '';

    /** Called with `true` for Yes and `false` for No */
    onInputChange?: (value: boolean) => void;

    /** Validation error shown under the buttons */
    errorText?: string;

    /** The question, read out by screen readers as the name of the Yes/No group */
    accessibilityLabel?: string;
};

/** A boolean asked as a Yes/No question, where No is an answer too */
function YesNoAdapter({value, onInputChange = () => {}, errorText, forwardedFSClass, accessibilityLabel}: YesNoAdapterProps) {
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
            forwardedFSClass={forwardedFSClass}
            accessibilityLabel={accessibilityLabel}
        />
    );
}

export default YesNoAdapter;
