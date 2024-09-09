import type {CONST as COMMON_CONST} from 'expensify-common';
import React, {useState} from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {CountryData} from '@libs/searchCountryOptions';
import CONST from '@src/CONST';
import StateSelectorModal from './StateSelectorModal';

type State = keyof typeof COMMON_CONST.STATES;

type StatePickerProps = {
    /** Current value of the selected item */
    value?: string;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Form Error description */
    errorText?: string;
};

function StatePicker({value, errorText, onInputChange = () => {}}: StatePickerProps) {
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
                title={value ? translate(`allStates.${value as State}.stateName`) : undefined}
                description={translate('common.state')}
                onPress={() => setIsPickerVisible(true)}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
            />
            <StateSelectorModal
                isVisible={isPickerVisible}
                currentState={value ?? ''}
                onStateSelected={updateInput}
                onClose={hidePickerModal}
                label={translate('common.state')}
                onBackdropPress={Navigation.dismissModal}
            />
        </>
    );
}

StatePicker.displayName = 'StatePicker';
export default StatePicker;
