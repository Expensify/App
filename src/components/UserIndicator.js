import React from 'react';
import styles from '../styles/styles';

const UserIndicator = ({ isOffline }) => {
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

export default UserIndicator;