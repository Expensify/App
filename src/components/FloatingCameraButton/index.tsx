import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import React from 'react';

import type FloatingCameraButtonProps from './types';

import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton({positionStyle}: FloatingCameraButtonProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera', 'ReceiptPlus']);
    const icon = getPlatform(true) === CONST.PLATFORM.MOBILE_WEB ? expensifyIcons.Camera : expensifyIcons.ReceiptPlus;

    return (
        <BaseFloatingCameraButton
            icon={icon}
            positionStyle={positionStyle}
        />
    );
}

export default FloatingCameraButton;
