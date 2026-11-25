import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import React from 'react';

import type {FloatingCameraButtonProps} from './BaseFloatingCameraButton';

import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton({style}: FloatingCameraButtonProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera', 'ReceiptPlus']);
    const icon = getPlatform(true) === CONST.PLATFORM.MOBILE_WEB ? expensifyIcons.Camera : expensifyIcons.ReceiptPlus;

    return (
        <BaseFloatingCameraButton
            icon={icon}
            style={style}
        />
    );
}

export default FloatingCameraButton;
