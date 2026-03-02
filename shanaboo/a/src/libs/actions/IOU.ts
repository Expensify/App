import {isEqual} from 'lodash';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {Receipt} from '@components/AttachmentModal/types';
import type {PaymentMethodType} from '@components/SettlementButton';
import * as API from '@libs/API';
import {isValidNumericInput} from '@libs/MoneyRequestUtils';
import type {CreateChatParams} from '@libs/API/parameters';
import type {
    CreateWorkspaceInvoiceParams,
    Transaction,
    TransactionChanges,
    TransactionViolation,
    SplitTransactionInformation,
} from '@src/types/onyx';
import type {Comment, IOUMessage, OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import type {PaymentMethodType as PaymentMethodTypeEnum} from '@src/types/onyx/Policy';
import type {DeepValueOf} from '@src/types/utils/DeepValueOf';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {isEmpty} from '@src/types/utils/EmptyObject';
import * as CurrencyUtils from './CurrencyUtils';
import DateUtils from './DateUtils';
import * as Device from './Device';
import * as TransactionUtils from './TransactionUtils';
import * as UserUtils from './UserUtils';
import * as ValidationUtils from './ValidationUtils';
import * as SplitUtils from './SplitUtils';

type MoneyRequestInformation = {
    amount: number;
    isFromGlobalCreate?: boolean;
};

type SplitUpdate = {
    amount?: number;
    percentage?: number;
};

let isNetworkOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
        currentUserPersonalDetails = personalDetails;
    },
});

/**
 * Gets the report ID for a given chat report.
 * If the chat report exists, returns its report ID. Otherwise, creates a new chat report and returns its report ID.
    comment: string,
    existingSplitTransaction: Transaction | undefined,
    splits: Split[],
    originalTransactionAmount?: number,
) {
    const payerEmail = PhoneNumber.addSMSDomainIfPhoneNumber(currentUserPersonalDetails?.login ?? '');
    const payerAccountID = currentUserPersonalDetails?.accountID ?? -1;
        return;
    }

    // Auto-adjust splits to match original transaction amount
    if (originalTransactionAmount !== undefined && splits.length > 0) {
        const adjustedSplits = SplitUtils.adjustSplitsToMatchTotal(splits, originalTransactionAmount, existingSplitTransaction);
        splits = adjustedSplits;
    }

    const existingSplitChatReportID = existingSplitTransaction?.reportID;
    const existingSplitReportAction = ReportActionsUtils.getReportAction(existingSplitChatReportID ?? '-1', existingSplitTransaction?.reportActionID ?? '');
    const isEditingSplit = !!existingSplitTransaction && !!existingSplitReportAction;
    comment: string,
    existingSplitTransaction: Transaction | undefined,
    splits: Split[],
    originalTransactionAmount?: number,
) {
    const {splitData, splits: updatedSplits} = splitBill(
        participants,
        comment,
        existingSplitTransaction,
        splits,
        originalTransactionAmount,
    );

    if (!splitData) {