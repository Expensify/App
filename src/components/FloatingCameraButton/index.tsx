import React from 'react';
import {Camera} from '@components/Icon/Expensicons';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton() {
    const platform = getPlatform(true);
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptPlus'] as const);
    const icon = platform === CONST.PLATFORM.MOBILE_WEB ? Camera : icons.ReceiptPlus;

    return <BaseFloatingCameraButton icon={icon} />;
}

FloatingCameraButton.displayName = 'FloatingCameraButton';

export default FloatingCameraButton;
