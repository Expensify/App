import React from 'react';
import {Camera} from '@components/Icon/Expensicons';
import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton() {
    return <BaseFloatingCameraButton icon={Camera} />;
}

FloatingCameraButton.displayName = 'FloatingCameraButton';

export default FloatingCameraButton;
