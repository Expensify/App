import React from 'react';
import {ReceiptPlus} from '@components/Icon/Expensicons';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton() {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera']);
    const icon = getPlatform(true) === CONST.PLATFORM.MOBILE_WEB ? expensifyIcons.Camera : ReceiptPlus;

    return <BaseFloatingCameraButton icon={icon} />;
}

FloatingCameraButton.displayName = 'FloatingCameraButton';

export default FloatingCameraButton;
