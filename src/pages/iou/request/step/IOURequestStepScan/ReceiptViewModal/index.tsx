import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentCarousel from '@components/Attachments/AttachmentCarousel';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Image from '@components/Image';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Receipt} from '@src/types/onyx/Transaction';

type ReceiptViewModalProps = {
    route: {
        params: {
            transactionID: string;
            reportID: string;
        };
    };
};

type ReceiptWithTransactionID = Receipt & {transactionID: string};

function ReceiptViewModal({route}: ReceiptViewModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [receipts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: (items) =>
            Object.values(items ?? {})
                .map((transaction) => (transaction?.receipt ? {...transaction?.receipt, transactionID: transaction.transactionID} : undefined))
                .filter((receipt): receipt is ReceiptWithTransactionID => !!receipt),
        canBeMissing: true,
    });

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route?.params?.reportID}`);

    const handleDelete = useCallback(() => {
        // onDelete();
        Navigation.goBack();
    }, []);

    const selectedReceipt = receipts?.find((receipt) => receipt.transactionID === route?.params?.transactionID);

    return (
        <Modal
            type="centered"
            isVisible
            onClose={Navigation.goBack}
        >
            <HeaderWithBackButton
                title={translate('common.receipt')}
                onBackButtonPress={Navigation.goBack}
                shouldShowThreeDotsButton
                threeDotsMenuIcon={Expensicons.Trashcan}
                onThreeDotsButtonPress={handleDelete}
            />

            <Image
                style={[styles.flex1]}
                source={{uri: selectedReceipt?.source ?? ''}}
            />
            {/* <AttachmentCarousel
                onClose={Navigation.goBack}
                report={report}
                source={selectedReceipt?.source}
            /> */}
        </Modal>
    );
}

ReceiptViewModal.displayName = 'ReceiptViewModal';

export default ReceiptViewModal;
