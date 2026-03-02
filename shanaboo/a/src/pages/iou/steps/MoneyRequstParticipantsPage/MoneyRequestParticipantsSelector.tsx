import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as IOU from '@libs/actions/IOU';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as SplitUtils from '@libs/SplitUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [splits, setSplits] = useState<Split[]>([]);
    const originalTransactionAmountRef = useRef<number | undefined>(transaction?.amount);

    const {canUseP2PDistanceRequests} = usePermissions(betas ?? []);

        }
    }, [transaction]);

    useEffect(() => {
        if (transaction?.amount !== undefined) {
            originalTransactionAmountRef.current = transaction.amount;
        }
    }, [transaction?.amount]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

            return;
        }

        const originalAmount = originalTransactionAmountRef.current ?? transaction.amount;
        IOU.splitBillAndOpenReport(selectedOptions, transaction.amount, transaction.currency, transaction.comment.comment ?? '', transaction, splits, originalAmount);
    }, [selectedOptions, transaction, splits]);

    const headerMessage = useMemo(() => {
        }

        const newSplits = selectedOptions.map((option) => ({email: option.login ?? '', accountID: option.accountID ?? -1, amount: 0, percentage: 0}));
        const adjustedSplits = SplitUtils.adjustSplitsToMatchTotal(newSplits, transaction.amount, transaction);
        setSplits(adjustedSplits);
    }, [selectedOptions, transaction]);

    const isAllowedToSplit = useMemo(() => {