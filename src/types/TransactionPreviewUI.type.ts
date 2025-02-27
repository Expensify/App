import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";
import type { PendingMessageProps } from "@components/ReportActionItem/MoneyRequestPreview/types";
import type { ThumbnailAndImageURI } from "@libs/ReceiptUtils";
import type { LocaleContextProps } from "@components/LocaleContextProvider";
import type { Errors, Icon, PendingAction } from "./onyx/OnyxCommon";

type TransactionPreviewUIProps = {
  isDeleted: boolean;
  isScanning: boolean;
  isWhisper: boolean;
  isHovered: boolean;
  isSettled: boolean;
  isPartialHold: boolean;
  isBillSplit: boolean;
  isApproved: boolean;
  isCurrentUserManager: boolean;
  isSettlementOrApprovalPartial: boolean;
  isReviewDuplicateTransactionPage: boolean;
  shouldShowSkeleton: boolean;
  shouldShowRBR: boolean;
  shouldDisableOnPress: boolean;
  shouldShowKeepButton: boolean;
  shouldShowDescription: boolean;
  shouldShowMerchant: boolean;
  shouldShowCategory: boolean;
  shouldShowTag: boolean;
  shouldShowPendingConversionMessage: boolean;
  displayAmount: string;
  category?: string;
  showCashOrCard: string;
  tag?: string;
  requestCurrency?: string;
  merchantOrDescription: string;
  previewHeaderText: string;
  requestAmount?: number;
  splitShare: number;
  receiptImages: ThumbnailAndImageURI[];
  sortedParticipantAvatars: Icon[];
  pendingMessageProps: PendingMessageProps;
  containerStyles?: StyleProp<ViewStyle>
  walletTermsErrors: Errors | undefined;
  pendingAction: PendingAction | undefined;
  showContextMenu: (event: GestureResponderEvent) => void;
  offlineWithFeedbackOnClose: () => void;
  translate: LocaleContextProps['translate'],
  navigateToReviewFields: () => void;
  onPreviewPressed: (event?: (GestureResponderEvent | KeyboardEvent | undefined)) => void;
};

export default TransactionPreviewUIProps;