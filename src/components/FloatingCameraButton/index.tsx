import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import BaseFloatingCameraButton from './BaseFloatingCameraButton';
import CameraIcon from './CameraIcon';

function FloatingCameraButton() {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ReceiptPlus']);
    const icon = getPlatform(true) === CONST.PLATFORM.MOBILE_WEB ? CameraIcon : expensifyIcons.ReceiptPlus;

    return <BaseFloatingCameraButton icon={icon} />;
}

export default FloatingCameraButton;
