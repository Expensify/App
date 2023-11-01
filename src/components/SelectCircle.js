import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';

const propTypes = {
    /** Should we show the checkmark inside the circle */
    isChecked: PropTypes.bool,

    /** Additional styles to pass to SelectCircle */
    // eslint-disable-next-line react/forbid-prop-types
    styles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    isChecked: false,
    styles: [],
};

function SelectCircle(props) {
    return (
        <View style={[styles.selectCircle, styles.alignSelfCenter, ...props.styles]}>
            {props.isChecked && (
                <Icon
                    src={Expensicons.Checkmark}
                    fill={themeColors.iconSuccessFill}
                />
            )}
        </View>
    );
}

SelectCircle.propTypes = propTypes;
SelectCircle.defaultProps = defaultProps;
SelectCircle.displayName = 'SelectCircle';

export default SelectCircle;
