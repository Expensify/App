// We should not render the component if there is no iouReport and it's not a split.
// Moved outside of the component scope to allow memoization of values later.
import lodashIsEmpty from 'lodash/isEmpty';
import type {Ref} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {Text as RNText} from 'react-native/Libraries/Text/Text';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, ReportAction, Session, Transaction, TransactionViolation, WalletTerms} from '@src/types/onyx';
import MoneyRequestPreview from './MoneyRequestPreview';
import MoneyRequestPreviewPropTypes from './moneyRequestPreviewPropTypes';

type MoneyRequestPreviewOnyxProps = {
    chatReport: OnyxEntry<Report>;
    iouReport: OnyxEntry<Report>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    session: OnyxEntry<Session>;
    transaction: OnyxEntry<Transaction>;
    transactionViolations: OnyxCollection<TransactionViolation[]>;
    walletTerms: OnyxEntry<WalletTerms>;
};

type MoneyRequestPreviewProps = {
    action?: OnyxEntry<ReportAction>;
    chatReportID?: string | null;
    checkIfContextMenuActive: () => void;
    containerStyles: StyleProp<ViewStyle>;
    contextMenuAnchor?: Ref<typeof RNText>;
    iouReportID?: string | null;
    isBillSplit: boolean;
    isHovered: boolean;
    isWhisper: boolean;
    onPreviewPressed: (() => void) | null;
    shouldShowPendingConversionMessage: boolean;
} & MoneyRequestPreviewOnyxProps;

// We should not render the component if there is no iouReport and it's not a split.
// Moved outside of the component scope to allow for easier use of hooks in the main component.
function MoneyRequestPreviewWrapper(props: MoneyRequestPreviewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return lodashIsEmpty(props.iouReport) && !props.isBillSplit ? null : <MoneyRequestPreview {...props} />;
}

MoneyRequestPreviewWrapper.propTypes = MoneyRequestPreviewPropTypes.propTypes;
MoneyRequestPreviewWrapper.defaultProps = MoneyRequestPreviewPropTypes.defaultProps;
MoneyRequestPreviewWrapper.displayName = 'MoneyRequestPreviewWrapper';

export default withOnyx<MoneyRequestPreviewProps, MoneyRequestPreviewOnyxProps>({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    chatReport: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
    },
    iouReport: {
        key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    transaction: {
        key: ({action}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${action?.originalMessage?.IOUTransactionID || 0}`,
    },
    walletTerms: {
        key: ONYXKEYS.WALLET_TERMS,
    },
    transactionViolations: {
        key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    },
})(MoneyRequestPreviewWrapper);
