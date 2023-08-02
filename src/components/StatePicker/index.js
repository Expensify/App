import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import useLocalize from '../../hooks/useLocalize';
import FormHelpMessage from '../FormHelpMessage';
import StateSelectorModal from './StateSelectorModal';

const propTypes = {
    /** Error text to display */
    errorText: PropTypes.string,

    /** State to display */
    value: PropTypes.string,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,

    /** A ref to forward to MenuItemWithTopDescription */
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),

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
    const allStates = translate('allStates');
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [searchValue, setSearchValue] = useState(lodashGet(allStates, `${value}.stateName`, ''));

    useEffect(() => {
        setSearchValue(lodashGet(allStates, `${value}.stateName`, ''));
    }, [value, allStates]);

    const showPickerModal = () => {
        setSearchValue(lodashGet(allStates, `${value}.stateName`, ''));
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateStateInput = (state) => {
        onInputChange(state.value);
        hidePickerModal();
    };

    const title = allStates[value] ? allStates[value].stateName : '';
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

export default React.forwardRef((props, ref) => (
    <StatePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
