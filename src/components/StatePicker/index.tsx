import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import React, {useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {MaybePhraseKey} from '@libs/Localize';
import type {CountryData} from '@libs/searchCountryOptions';
import StateSelectorModal from './StateSelectorModal';
import type {State} from './StateSelectorModal';

type StatePickerProps = {
    /** Error text to display */
    errorText?: MaybePhraseKey;

    /** State to display */
    value?: State;

    /** Callback to call when the input changes */
    onInputChange?: (value: string) => void;

    /** Label to display on field */
    label?: string;

    /** Any additional styles to apply */
    wrapperStyle?: MenuItemProps['wrapperStyle'];

    /**  Callback to call when the picker modal is dismissed */
    onBlur?: () => void;
};

function StatePicker({value, onInputChange, label, onBlur, errorText = '', wrapperStyle}: StatePickerProps, ref: ForwardedRef<View>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = (shouldBlur = true) => {
        if (shouldBlur) {
            onBlur?.();
        }
        setIsPickerVisible(false);
    };

    const updateStateInput = (state: CountryData) => {
        if (state.value !== value) {
            onInputChange?.(state.value);
        }
        // If the user selects any state, call the hidePickerModal function with shouldBlur = false
        // to prevent the onBlur function from being called.
        hidePickerModal(false);
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
                wrapperStyle={wrapperStyle}
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
