import React from 'react';
import {Camera, ReceiptPlus} from '@components/Icon/Expensicons';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton() {
    const platform = getPlatform(true);
    const icon = platform === CONST.PLATFORM.MOBILE_WEB ? Camera : ReceiptPlus;

    return <BaseFloatingCameraButton icon={icon} />;
}

FloatingCameraButton.displayName = 'FloatingCameraButton';

export default FloatingCameraButton;
