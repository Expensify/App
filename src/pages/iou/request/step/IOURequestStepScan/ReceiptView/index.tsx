import {transactionDraftReceiptsViewSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ConfirmModalActions} from '@components/Modal/Global/ConfirmModalWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {removeDraftTransaction, removeTransactionReceipt, replaceDefaultDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Receipt} from '@src/types/onyx/Transaction';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type ReceiptWithTransactionIDAndSource = Receipt & ReceiptFile;

type ReceiptViewProps = {
    route: {
        params: {
            transactionID: string;
            backTo: Route;
        };
    };
};

function ReceiptView({route}: ReceiptViewProps) {
    const {translate} = useLocalize();
    const {setAttachmentError} = useAttachmentErrors();
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const [page, setPage] = useState<number>(-1);
    const {showConfirmModal} = useConfirmModal();

    const [receipts = getEmptyArray<ReceiptWithTransactionIDAndSource>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: transactionDraftReceiptsViewSelector,
        canBeMissing: true,
    });

    // Derive currentReceipt from page - always in sync with carousel position
    const currentReceipt = page >= 0 ? receipts.at(page) : undefined;

    const secondTransactionID = receipts.at(1)?.transactionID;
    const [secondTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${secondTransactionID}`, {canBeMissing: true});

    // Set initial page based on route transactionID
    useEffect(() => {
        if (!receipts || receipts.length === 0) {
            return;
        }

        const activeReceiptIndex = receipts.findIndex((receipt) => receipt.transactionID === route?.params?.transactionID);
        setPage(activeReceiptIndex);
    }, [receipts, route?.params?.transactionID]);

    const handleDeleteReceipt = useCallback(() => {
        if (!currentReceipt) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            if (currentReceipt.transactionID === CONST.IOU.OPTIMISTIC_TRANSACTION_ID) {
                if (receipts.length === 1) {
                    removeTransactionReceipt(currentReceipt.transactionID);
                    return;
                }

                replaceDefaultDraftTransaction(secondTransactionID ? secondTransaction : undefined);
                return;
            }
            removeDraftTransaction(currentReceipt.transactionID);
        });

        Navigation.goBack();
    }, [currentReceipt, receipts.length, secondTransaction, secondTransactionID]);

    const deleteReceipt = useCallback(() => {
        handleDeleteReceipt();
    }, [handleDeleteReceipt]);

    const handleGoBack = useCallback(() => {
        Navigation.goBack(route.params.backTo);
    }, [route.params.backTo]);

    const handleDeleteReceiptPress = useCallback(async () => {
        const result = await showConfirmModal({
            title: translate('receipt.deleteReceipt'),
            prompt: translate('receipt.deleteConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        });
        if (result.action !== ConfirmModalActions.CONFIRM) {
            return;
        }
        deleteReceipt();
    }, [showConfirmModal, translate, deleteReceipt]);

    return (
        <ScreenWrapper
            testID="ReceiptView"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('common.receipt')}
                shouldDisplayHelpButton={false}
                onBackButtonPress={handleGoBack}
            >
                <Button
                    shouldShowRightIcon
                    iconRight={expensifyIcons.Trashcan}
                    onPress={handleDeleteReceiptPress}
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
                onSwipeDown={handleGoBack}
                autoHideArrows={autoHideArrows}
                cancelAutoHideArrow={cancelAutoHideArrows}
                setShouldShowArrows={setShouldShowArrows}
                onAttachmentError={setAttachmentError}
                shouldShowArrows={shouldShowArrows}
            />
        </ScreenWrapper>
    );
}

export default ReceiptView;
