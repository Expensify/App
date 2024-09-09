import React, {useState} from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {CountryData} from '@libs/searchCountryOptions';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import CountrySelectorModal from './CountrySelectorModal';

type CountryPickerProps = {
    /** Current value of the selected item */
    value?: string;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Form Error description */
    errorText?: string;
};

function CountryPicker({value, errorText, onInputChange = () => {}}: CountryPickerProps) {
    const {translate} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (item: CountryData) => {
        onInputChange?.(item.value);
        hidePickerModal();
    };

    return (
        <>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={value ? translate(`allCountries.${value}` as TranslationPaths) : undefined}
                description={translate('common.country')}
                onPress={() => setIsPickerVisible(true)}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
            />
            <CountrySelectorModal
                isVisible={isPickerVisible}
                currentCountry={value ?? ''}
                onCountrySelected={updateInput}
                onClose={hidePickerModal}
                label={translate('common.country')}
                onBackdropPress={Navigation.dismissModal}
            />
        </>
    );
}

CountryPicker.displayName = 'CountryPicker';
export default CountryPicker;
