import React, {useCallback, useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getTransactionOrDraftTransaction} from '@libs/TransactionUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {removeDraftTransaction, removeTransactionReceipt, replaceDefaultDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Receipt} from '@src/types/onyx/Transaction';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type ReceiptWithTransactionIDAndSource = Receipt & ReceiptFile;

type ReceiptViewModalProps = {
    route: {
        params: {
            transactionID: string;
            backTo: Route;
        };
    };
};

function ReceiptViewModal({route}: ReceiptViewModalProps) {
    const {translate} = useLocalize();
    const {setAttachmentError, clearAttachmentErrors} = useAttachmentErrors();
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();
    const styles = useThemeStyles();

    const [currentReceipt, setCurrentReceipt] = useState<ReceiptWithTransactionIDAndSource | null>();
    const [page, setPage] = useState<number>(-1);
    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);

    const [receipts = getEmptyArray<ReceiptWithTransactionIDAndSource>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: (items) =>
            Object.values(items ?? {})
                .map((transaction) => (transaction?.receipt ? {...transaction?.receipt, transactionID: transaction.transactionID} : undefined))
                .filter((receipt): receipt is ReceiptWithTransactionIDAndSource => !!receipt),
        canBeMissing: true,
    });

    useEffect(() => {
        if (!receipts || receipts.length === 0) {
            return;
        }

        const activeReceipt = receipts.find((receipt) => receipt.transactionID === route?.params?.transactionID);
        const activeReceiptIndex = receipts.findIndex((receipt) => receipt.transactionID === activeReceipt?.transactionID);

        setCurrentReceipt(activeReceipt);
        setPage(activeReceiptIndex);
    }, [receipts, route?.params?.transactionID]);

    const handleDeleteReceipt = useCallback(() => {
        if (!currentReceipt) {
            return;
        }

        InteractionManager.runAfterInteractions(() => {
            if (currentReceipt.transactionID === CONST.IOU.OPTIMISTIC_TRANSACTION_ID) {
                if (receipts.length === 1) {
                    removeTransactionReceipt(currentReceipt.transactionID);
                    return;
                }

                const secondTransactionID = receipts.at(1)?.transactionID;
                const secondTransaction = secondTransactionID ? getTransactionOrDraftTransaction(secondTransactionID) : undefined;
                replaceDefaultDraftTransaction(secondTransaction);
                return;
            }
            removeDraftTransaction(currentReceipt.transactionID);
        });

        Navigation.goBack();
    }, [currentReceipt, receipts]);

    const handleCloseConfirmModal = () => {
        setIsDeleteReceiptConfirmModalVisible(false);
    };

    const deleteReceipt = useCallback(() => {
        handleCloseConfirmModal();
        handleDeleteReceipt();
    }, [handleDeleteReceipt]);

    const handleGoBack = useCallback(() => {
        Navigation.goBack(route.params.backTo);
    }, [route.params.backTo]);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible
            onClose={handleGoBack}
            onModalHide={clearAttachmentErrors}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('common.receipt')}
                shouldDisplayHelpButton={false}
                onBackButtonPress={handleGoBack}
                onCloseButtonPress={handleCloseConfirmModal}
            >
                <Button
                    shouldShowRightIcon
                    iconRight={Expensicons.Trashcan}
                    onPress={() => setIsDeleteReceiptConfirmModalVisible(true)}
                    innerStyles={styles.bgTransparent}
                    large
                />
            </HeaderWithBackButton>
            <AttachmentCarouselView
                attachments={receipts}
                source={currentReceipt?.source ?? ''}
                page={page}
                setPage={setPage}
                attachmentID={currentReceipt?.transactionID}
                onClose={handleGoBack}
                autoHideArrows={autoHideArrows}
                cancelAutoHideArrow={cancelAutoHideArrows}
                setShouldShowArrows={setShouldShowArrows}
                onAttachmentError={setAttachmentError}
                shouldShowArrows={shouldShowArrows}
            />
            <ConfirmModal
                title={translate('receipt.deleteReceipt')}
                isVisible={isDeleteReceiptConfirmModalVisible}
                onConfirm={deleteReceipt}
                onCancel={handleCloseConfirmModal}
                prompt={translate('receipt.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                onBackdropPress={handleCloseConfirmModal}
                danger
            />
        </Modal>
    );
}

ReceiptViewModal.displayName = 'ReceiptViewModal';

export default ReceiptViewModal;
