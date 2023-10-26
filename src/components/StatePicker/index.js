import React, {useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import styles from '../../styles/styles';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import useLocalize from '../../hooks/useLocalize';
import FormHelpMessage from '../FormHelpMessage';
import StateSelectorModal from './StateSelectorModal';
import refPropTypes from '../refPropTypes';

const propTypes = {
    /** Error text to display */
    errorText: PropTypes.string,

    /** State to display */
    value: PropTypes.string,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,

    /** A ref to forward to MenuItemWithTopDescription */
    forwardedRef: refPropTypes,

    /** Label to display on field */
    label: PropTypes.string,
};

const defaultProps = {
    value: undefined,
    forwardedRef: undefined,
    errorText: '',
    onInputChange: () => {},
    label: undefined,
};

function StatePicker({value, errorText, onInputChange, forwardedRef, label}) {
    const {translate} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateStateInput = (state) => {
        if (state.value !== value) {
            onInputChange(state.value);
        }
        hidePickerModal();
    };

    const title = value && _.keys(COMMON_CONST.STATES).includes(value) ? translate(`allStates.${value}.stateName`) : '';
    const descStyle = title.length === 0 ? styles.textNormal : null;

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                title={title}
                description={label || translate('common.state')}
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

StatePicker.propTypes = propTypes;
StatePicker.defaultProps = defaultProps;
StatePicker.displayName = 'StatePicker';

const StatePickerWithRef = React.forwardRef((props, ref) => (
    <StatePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

StatePickerWithRef.displayName = 'StatePickerWithRef';

export default StatePickerWithRef;
