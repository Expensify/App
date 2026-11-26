import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import React from 'react';

import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton() {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera', 'ReceiptPlus']);
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();
    const icon = getPlatform(true) === CONST.PLATFORM.MOBILE_WEB ? expensifyIcons.Camera : expensifyIcons.ReceiptPlus;

    return (
        <BaseFloatingCameraButton
            icon={icon}
            style={isInLandscapeMode && styles.floatingCameraButtonLandscape}
        />
    );
}

export default FloatingCameraButton;
