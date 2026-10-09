import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData, {INLINE_FIELD_ERROR_KEYS} from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import ScanFooter from '@components/MoneyRequestConfirmationListFooter/variants/ScanFooter';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

import React, {useEffect, useState} from 'react';

/**
 * Confirms a scanned expense. The only variant that reaches the compact layout, where the receipt fills the
 * screen and the optional fields collapse behind a show-more button, so it owns that state.
 */
function ScanConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {partiallyManuallyFilledScanID} = props;
    const isInLandscapeMode = useIsInLandscapeMode();

    const [showMoreFields, setShowMoreFields] = useState(false);

    const data = useConfirmationListData(props);
    const {transactionID} = data.layoutProps;

    // Reveal the collapsed fields when one of them raises an inline error, or opening the section and pressing
    // Create looks like it did nothing. Done during render so it survives the remount a multi-scan switch causes.
    // In a multi-scan the error stays set while another receipt is partially filled, so only expand the receipt it belongs to.
    const doesFormErrorBelongToThisReceipt = !partiallyManuallyFilledScanID || partiallyManuallyFilledScanID === transactionID;
    if (INLINE_FIELD_ERROR_KEYS.has(data.footerProps.errorState.formError) && doesFormErrorBelongToThisReceipt && !showMoreFields) {
        setShowMoreFields(true);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset show more on transaction change
        setShowMoreFields(false);
    }, [transactionID]);

    const isCompactMode = !showMoreFields && !isInLandscapeMode;

    return (
        <ConfirmationListLayout
            {...data.layoutProps}
            fieldFlags={{isScanRequest: true}}
            isCompactMode={isCompactMode}
            listFooterContent={
                <ScanFooter
                    {...data.footerProps}
                    isCompactMode={isCompactMode}
                    compactControls={{showMoreFields, setShowMoreFields}}
                />
            }
        >
            <TaxController {...data.taxControllerProps} />
            <SplitBillController {...data.splitBillControllerProps} />
            <FieldAutoSelector {...data.fieldAutoSelectProps} />
        </ConfirmationListLayout>
    );
}

export default ScanConfirmationList;
