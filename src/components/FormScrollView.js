import React from 'react';
import PropTypes from 'prop-types';
import {ScrollView} from 'react-native';
import styles from '../styles/styles';

const propTypes = {
    /** Form elements */
    children: PropTypes.node.isRequired,
};

const FormScrollView = React.forwardRef((props, ref) => (
    <ScrollView
        style={[styles.w100, styles.flex1]}
        ref={ref}
        contentContainerStyle={styles.flexGrow1}
        keyboardShouldPersistTaps="handled"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {props.children}
    </ScrollView>
));

FormScrollView.propTypes = propTypes;
export default FormScrollView;
