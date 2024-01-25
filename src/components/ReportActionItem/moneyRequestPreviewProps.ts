import type {Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText, StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {PersonalDetailsList, Report, Session, Transaction, TransactionViolation, WalletTerms} from '@src/types/onyx';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import type {ReportActionBase} from '@src/types/onyx/ReportAction';

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
    action: OnyxEntry<ReportActionBase & OriginalMessageIOU>;
    chatReportID: string;
    checkIfContextMenuActive: () => void;
    containerStyles: StyleProp<ViewStyle>;
    contextMenuAnchor?: Ref<typeof RNText>;
    iouReportID: string;
    isBillSplit: boolean;
    isHovered: boolean;
    isWhisper: boolean;
    onPreviewPressed: (() => void) | null;
    shouldShowPendingConversionMessage: boolean;
} & MoneyRequestPreviewOnyxProps;

export type {MoneyRequestPreviewProps, MoneyRequestPreviewOnyxProps};
