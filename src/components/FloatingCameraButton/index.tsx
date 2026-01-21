import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton() {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera', 'ReceiptPlus']);
    const icon = getPlatform(true) === CONST.PLATFORM.MOBILE_WEB ? expensifyIcons.Camera : expensifyIcons.ReceiptPlus;

    return <BaseFloatingCameraButton icon={icon} />;
}

export default FloatingCameraButton;
