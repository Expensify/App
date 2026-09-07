import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import type {Attachment} from '@components/Attachments/types';
import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';

import useConfirmModal from '@hooks/useConfirmModal';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionDraftReceipts from '@hooks/useTransactionDraftReceipts';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import {removeDraftTransaction, removeTransactionReceipt, replaceDefaultDraftTransaction} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useCallback, useEffect, useState} from 'react';

type DynamicReceiptViewProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DYNAMIC_RECEIPT_VIEW>;

function DynamicReceiptView({route}: DynamicReceiptViewProps) {
    const {translate} = useLocalize();
    const {setAttachmentError} = useAttachmentErrors();
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Trashcan']);
    const [page, setPage] = useState<number>(-1);
    const {showConfirmModal} = useConfirmModal();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_RECEIPT_VIEW.path);

    const receipts = useTransactionDraftReceipts();

    // Derive currentReceipt from page - always in sync with carousel position
    const currentReceipt = page >= 0 ? receipts.at(page) : undefined;

    const secondTransactionID = receipts.at(1)?.transactionID;
    const [secondTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${secondTransactionID}`);

    // Set initial page based on route transactionID
    useEffect(() => {
        if (!receipts || receipts.length === 0) {
            return;
        }

        const activeReceiptIndex = receipts.findIndex((receipt) => receipt.transactionID === route?.params?.transactionID);
        setPage(activeReceiptIndex);
    }, [receipts, route?.params?.transactionID]);

    const deleteReceipt = () => {
        if (!currentReceipt) {
            return;
        }

        const handleDeleteReceipt = () => {
            if (currentReceipt.transactionID === CONST.IOU.OPTIMISTIC_TRANSACTION_ID) {
                if (receipts.length === 1) {
                    removeTransactionReceipt(currentReceipt.transactionID);
                    return;
                }

                replaceDefaultDraftTransaction(secondTransactionID ? secondTransaction : undefined);
                return;
            }
            removeDraftTransaction(currentReceipt.transactionID);
        };

        Navigation.goBack(undefined, {afterTransition: handleDeleteReceipt});
    };

    const handleGoBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const handleDeleteReceiptPress = useCallback(async () => {
        const result = await showConfirmModal({
            title: translate('receipt.deleteReceipt'),
            prompt: translate('receipt.deleteConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        });
        if (result.action !== ModalActions.CONFIRM) {
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
                    onPress={handleDeleteReceiptPress}
                    innerStyles={styles.bgTransparent}
                    size={CONST.BUTTON_SIZE.LARGE}
                    sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.RECEIPT_DELETE_BUTTON}
                >
                    <Button.Icon src={expensifyIcons.Trashcan} />
                </Button>
            </HeaderWithBackButton>
            <AttachmentCarouselView
                attachments={receipts as Attachment[]}
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

export default DynamicReceiptView;
