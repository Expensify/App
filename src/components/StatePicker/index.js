import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import useLocalize from '../../hooks/useLocalize';
import FormHelpMessage from '../FormHelpMessage';
import StateSelectorModal from './StateSelectorModal';

const propTypes = {
    /** Error text to display */
    errorText: PropTypes.string,

    /** Default value to display */
    defaultValue: PropTypes.string,

    /** State to display */
    // eslint-disable-next-line react/require-default-props
    value: PropTypes.string,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,
};

const defaultProps = {
    errorText: '',
    defaultValue: '',
    onInputChange: () => {},
};

function StatePicker({value, defaultValue, errorText, onInputChange}, ref) {
    const {translate} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const formValue = value || defaultValue || '';

    const title = useMemo(() => {
        const allStates = translate('allStates');

        if (allStates[formValue]) {
            return allStates[formValue].stateName;
        }

        return '';
    }, [translate, formValue]);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const onStateSelected = (state) => {
        onInputChange(state.value);
        hidePickerModal();
    };

    const descStyle = title.length === 0 ? styles.addressPickerDescription : null;

    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon
                title={title}
                description={translate('common.state')}
                descriptionTextStyle={descStyle}
                onPress={showPickerModal}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
            <StateSelectorModal
                key={formValue}
                isVisible={isPickerVisible}
                currentState={formValue}
                onClose={hidePickerModal}
                onStateSelected={onStateSelected}
            />
        </View>
    );
}

StatePicker.propTypes = propTypes;
StatePicker.defaultProps = defaultProps;
StatePicker.displayName = 'StatePicker';

export default React.forwardRef(StatePicker);
