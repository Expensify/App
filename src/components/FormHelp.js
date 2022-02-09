import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    /** Content of FormHelp */
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any.isRequired,
};

const FormHelp = (props) => {
    if (_.isEmpty(props.children)) {
        return null;
    }

    return (
        <View
            style={[
                styles.mt1,
                styles.flexRow,
                styles.justifyContentBetween,
                styles.ph3,
            ]}
        >
            {props.children}
        </View>
    );
};

FormHelp.propTypes = propTypes;
FormHelp.displayName = 'FormHelp';
export default FormHelp;
