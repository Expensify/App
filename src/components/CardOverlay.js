import React from 'react';
import {View} from 'react-native';
import themeColors from '../styles/themes/default';

const CardOverlay = () => (
    <View
        style={{
            backgroundColor: themeColors.modalBackdrop,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.5,
        }}
    />
);

export default CardOverlay;
