import React from 'react';
import styles from '../styles/styles';
import PropTypes from 'prop-types';

const propTypes = {
    isOffline: PropTypes.func.isRequired,
};

const UserIndicator = ({isOffline}) => {
    const onlineStyle = isOffline ? styles.statusIndicatorOffline : styles.statusIndicatorOnline;
    return (
        <div
            style={{
                ...styles.statusIndicator,
                ...onlineStyle
            }}
        />
    )
}

UserIndicator.propTypes = propTypes;
export default UserIndicator;