import React, {useCallback, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type CountrySelectionProps = {

}

function CountrySelection({}: CountrySelectionProps) {
    const onCountrySelected = useCallback((country: string) => {
      console.log(country)
    }, []);

    return (
        <CountrySelectionList
            selectedCountry={''}
            countries={CONST.BBA_SUPPORTED_COUNTRIES}
            onCountrySelected={onCountrySelected}
        />
    );
}

CountrySelection.displayName = 'CountrySelection';

export default CountrySelection;
