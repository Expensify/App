/** "Processing receipt..." pill shown while a capture is being cropped. It waits 300 ms first, so a fast crop never shows it. */
import ActivityIndicator from '@components/ActivityIndicator';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import React from 'react';

import ReceiptStatusPill from './ReceiptStatusPill';

const APPEAR_DELAY_MS = 300;

function ReceiptProcessingToast() {
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <ReceiptStatusPill
            message={translate('receipt.processingReceipt')}
            appearDelayMs={APPEAR_DELAY_MS}
        >
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                color={theme.textReversed}
            />
        </ReceiptStatusPill>
    );
}

export default ReceiptProcessingToast;
