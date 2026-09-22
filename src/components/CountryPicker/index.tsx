import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useLocalize from '@hooks/useLocalize';

import type {Option} from '@libs/searchOptions';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import React, {useState} from 'react';

import CountrySelectorModal from './CountrySelectorModal';

type CountryPickerProps = {
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

    const updateInput = (item: Option) => {
        onInputChange?.(item.value);
        hidePickerModal();
    };

    return (
        <>
            <MenuItem.Root onPress={callFunctionIfActionIsAllowed(() => setIsPickerVisible(true))}>
                <MenuItemField.Row
                    name={translate('common.country')}
                    value={value ? translate(`allCountries.${value}` as TranslationPaths) : undefined}
                >
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    <MenuItem.Chevron />
                </MenuItemField.Row>
                {!!errorText && (
                    <MenuItem.HelpText
                        isError
                        message={errorText}
                    />
                )}
            </MenuItem.Root>
            <CountrySelectorModal
                isVisible={isPickerVisible}
                currentCountry={value ?? ''}
                onCountrySelected={updateInput}
                onClose={hidePickerModal}
                label={translate('common.country')}
                onBackdropPress={hidePickerModal}
            />
        </>
    );
}

export default CountryPicker;
