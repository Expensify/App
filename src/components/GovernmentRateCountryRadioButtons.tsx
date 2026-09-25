import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import React from 'react';

import RadioButtons from './RadioButtons';

type GovernmentRateCountryRadioButtonsProps = {
    /** Callback with the chosen country code */
    onSelect: (countryCode: string) => void;
};

/** Radio list of the countries that share the EUR government mileage rates, for the auto-update country prompt. */
function GovernmentRateCountryRadioButtons({onSelect}: GovernmentRateCountryRadioButtonsProps) {
    const {translate} = useLocalize();

    const items = CONST.CUSTOM_UNITS.GOVERNMENT_RATE_SUPPORTED_EUR_COUNTRIES.map((countryCode) => ({
        label: translate(`allCountries.${countryCode}` as TranslationPaths),
        value: countryCode,
    }));

    return (
        <RadioButtons
            items={items}
            onSelect={onSelect}
        />
    );
}

export default GovernmentRateCountryRadioButtons;
