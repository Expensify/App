import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import React from 'react';

import type {FloatingCameraButtonProps} from './BaseFloatingCameraButton';

import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton({style}: FloatingCameraButtonProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera']);

    return (
        <BaseFloatingCameraButton
            icon={expensifyIcons.Camera}
            style={style}
        />
    );
}

export default FloatingCameraButton;
