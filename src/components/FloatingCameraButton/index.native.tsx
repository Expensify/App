import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import React from 'react';

import type FloatingCameraButtonProps from './types';

import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton({positionStyle}: FloatingCameraButtonProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera']);

    return (
        <BaseFloatingCameraButton
            icon={expensifyIcons.Camera}
            positionStyle={positionStyle}
        />
    );
}

export default FloatingCameraButton;
