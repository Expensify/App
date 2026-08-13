import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';

import CONST from '@src/CONST';

import type {Ref} from 'react';

import React, {useImperativeHandle, useState} from 'react';

type MoneyRequestReportTransactionLongPressModalHandle = {
    /** Opens the modal for the given transaction */
    show: (transactionID: string) => void;
};

type MoneyRequestReportTransactionLongPressModalProps = {
    /** Whether the mobile selection mode is currently enabled */
    isMobileSelectionModeEnabled: boolean;

    /** Callback to toggle the selection state of a transaction */
    toggleTransaction: (transactionID: string) => void;

    /** Imperative handle used to open the modal */
    ref: Ref<MoneyRequestReportTransactionLongPressModalHandle>;
};

function MoneyRequestReportTransactionLongPressModal({isMobileSelectionModeEnabled, toggleTransaction, ref}: MoneyRequestReportTransactionLongPressModalProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['CheckSquare']);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedTransactionID, setSelectedTransactionID] = useState('');

    useImperativeHandle(ref, () => ({
        show: (transactionID: string) => {
            setSelectedTransactionID(transactionID);
            setIsVisible(true);
        },
    }));

    return (
        <Modal
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            onClose={() => setIsVisible(false)}
            shouldPreventScrollOnFocus
        >
            <MenuItem
                title={translate('common.select')}
                icon={expensifyIcons.CheckSquare}
                onPress={() => {
                    if (!isMobileSelectionModeEnabled) {
                        turnOnMobileSelectionMode();
                    }
                    toggleTransaction(selectedTransactionID);
                    setIsVisible(false);
                }}
            />
        </Modal>
    );
}

export default MoneyRequestReportTransactionLongPressModal;
export type {MoneyRequestReportTransactionLongPressModalHandle};
