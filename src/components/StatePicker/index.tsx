import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import React, {ForwardedRef, useState} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CountryData} from '@libs/searchCountryOptions';
import StateSelectorModal, {type State} from './StateSelectorModal';

type StatePickerProps = {
    /** Error text to display */
    errorText?: string;

    /** State to display */
    value?: State;

    /** Callback to call when the input changes */
    onInputChange?: (value: string) => void;

    /** Label to display on field */
    label?: string;
};

function StatePicker({value, onInputChange, label, errorText = ''}: StatePickerProps, ref: ForwardedRef<View>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateStateInput = (state: CountryData) => {
        if (state.value !== value) {
            onInputChange?.(state.value);
        }
        hidePickerModal();
    };

    const title = value && Object.keys(COMMON_CONST.STATES).includes(value) ? translate(`allStates.${value}.stateName`) : '';
    const descStyle = title.length === 0 ? styles.textNormal : null;

    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon
                title={title}
                description={label ?? translate('common.state')}
                descriptionTextStyle={descStyle}
                onPress={showPickerModal}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
            <StateSelectorModal
                isVisible={isPickerVisible}
                currentState={value}
                onClose={hidePickerModal}
                onStateSelected={updateStateInput}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                label={label}
            />
        </View>
    );
}

StatePicker.displayName = 'StatePicker';

export default React.forwardRef(StatePicker);
