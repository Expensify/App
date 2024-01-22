import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import refPropTypes from '@components/refPropTypes';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import ValueSelectorModal from './ValueSelectorModal';

const propTypes = {
    /** Form Error description */
    errorText: PropTypes.string,

    /** Item to display */
    value: PropTypes.string,

    /** A placeholder value to display */
    placeholder: PropTypes.string,

    /** Items to pick from */
    items: PropTypes.arrayOf(PropTypes.shape({value: PropTypes.string, label: PropTypes.string})),

    /** Label of picker */
    label: PropTypes.string,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,

    /** Text to display under the main menu item */
    furtherDetails: PropTypes.string,

    /** A ref to forward to MenuItemWithTopDescription */
    forwardedRef: refPropTypes,

    /** Whether to show the toolip text */
    shouldShowTooltips: PropTypes.bool,
};

const defaultProps = {
    value: undefined,
    label: undefined,
    placeholder: '',
    items: {},
    forwardedRef: undefined,
    errorText: '',
    furtherDetails: undefined,
    onInputChange: () => {},
    shouldShowTooltips: true,
};

function ValuePicker({value, label, items, placeholder, errorText, onInputChange, furtherDetails, shouldShowTooltips, forwardedRef}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (item) => {
        if (item.value !== value) {
            onInputChange(item.value);
        }
        hidePickerModal();
    };

    const descStyle = !value || value.length === 0 ? StyleUtils.getFontSizeStyle(variables.fontSizeLabel) : null;
    const selectedItem = _.find(items, {value});
    const selectedLabel = selectedItem ? selectedItem.label : '';

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                title={selectedLabel || placeholder || ''}
                descriptionTextStyle={descStyle}
                description={label}
                onPress={showPickerModal}
                furtherDetails={furtherDetails}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
            <ValueSelectorModal
                isVisible={isPickerVisible}
                label={label}
                selectedItem={selectedItem}
                items={items}
                onClose={hidePickerModal}
                onItemSelected={updateInput}
                shouldShowTooltips={shouldShowTooltips}
            />
        </View>
    );
}

ValuePicker.propTypes = propTypes;
ValuePicker.defaultProps = defaultProps;
ValuePicker.displayName = 'ValuePicker';

const ValuePickerWithRef = React.forwardRef((props, ref) => (
    <ValuePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

ValuePickerWithRef.displayName = 'ValuePickerWithRef';

export default ValuePickerWithRef;
