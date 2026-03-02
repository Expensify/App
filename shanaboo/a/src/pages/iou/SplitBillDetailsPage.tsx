import React, {useCallback, useMemo, useState, useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as IOU from '@libs/actions/IOU';
import * as ReportUtils from '@libs/ReportUtils';
import * as SplitUtils from '@libs/SplitUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const [splits, setSplits] = useState<Split[]>(transaction?.splitShares ?? []);
    const [manuallyEditedSplits, setManuallyEditedSplits] = useState<Set<number>>(new Set());

    const transactionAmount = useMemo(() => {
        if (!transaction) {
        return transaction.amount;
    }, [transaction]);

    // Auto-adjust splits when transaction amount changes or splits are added
    useEffect(() => {
        if (transactionAmount === undefined || splits.length === 0) {
            return;
        }

        // Only auto-adjust if we're not editing existing splits
        const isEditingExisting = !!transaction?.splitShares && transaction.splitShares.length > 0;
        if (isEditingExisting) {
            return;
        }

        const adjustedSplits = SplitUtils.adjustSplitsToMatchTotal(
            splits,
            transactionAmount,
            isEditingExisting ? transaction : undefined
        );

        // Only update if the splits have actually changed
        if (JSON.stringify(adjustedSplits) !== JSON.stringify(splits)) {
            setSplits(adjustedSplits);
        }
    }, [transactionAmount, splits.length, transaction]);

    const formattedAmount = useMemo(() => {
        if (transactionAmount === undefined) {
            return '';
        return CurrencyUtils.convertToDisplayString(transactionAmount, transaction?.currency);
    }, [transactionAmount, transaction?.currency]);

    const handleSplitChange = useCallback((index: number, updatedSplit: Split) => {
        setManuallyEditedSplits(prev => new Set(prev).add(index));
        setSplits(prev => prev.map((split, i) => i === index ? updatedSplit : split));
    }, []);

    const addSplit = useCallback(() => {
        const newSplit = {
            email: '',
            amount: 0,
            percentage: 0,
        };
        const updatedSplits = SplitUtils.addSplitAndRedistribute(splits, transactionAmount ?? 0);
        setSplits(updatedSplits);
    }, [splits, transactionAmount]);

    const removeSplit = useCallback((index: number) => {
            return;
        }

        IOU.splitBillAndOpenReport(participants, transactionAmount, transaction?.currency ?? CONST.CURRENCY.USD, comment, transaction, splits, transactionAmount);
    }, [transaction, transactionAmount, splits]);

    const participants = useMemo(() => {
                            <SplitBillParticipantForm
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                                onSplitChange={(updatedSplit) => handleSplitChange(index, updatedSplit)}
                                onRemove={() => removeSplit(index)}
                                split={split}
                                isOnlySplit={splits.length === 1}