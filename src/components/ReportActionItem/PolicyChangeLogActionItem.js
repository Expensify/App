import React from 'react';
import PropTypes from 'prop-types';
import Text from '../Text';
import styles from '../../styles/styles';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,
};

const PolicyChangeLogActionItem = props => (
    <Text style={[styles.pv3, styles.ph5, styles.textLabelSupporting]}>
        {props.action.text}
    </Text>
);

PolicyChangeLogActionItem.propTypes = propTypes;
PolicyChangeLogActionItem.displayName = 'PolicyChangeLogActionItem';

export default PolicyChangeLogActionItem;
