import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import React from 'react';

import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton() {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera']);

    return <BaseFloatingCameraButton icon={expensifyIcons.Camera} />;
}

export default FloatingCameraButton;
