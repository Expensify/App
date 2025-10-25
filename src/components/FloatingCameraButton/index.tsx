import React from 'react';
import {ReceiptPlus} from '@components/Icon/Expensicons';
import BaseFloatingCameraButton from './BaseFloatingCameraButton';

function FloatingCameraButton() {
    return <BaseFloatingCameraButton icon={ReceiptPlus} />;
}

FloatingCameraButton.displayName = 'FloatingCameraButton';

export default FloatingCameraButton;
