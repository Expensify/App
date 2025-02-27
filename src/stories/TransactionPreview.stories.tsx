import type { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { View } from "react-native";
import { Hourglass } from "@components/Icon/Expensicons";
import TransactionPreview from "@components/ReportActionItem/MoneyRequestPreview/TransactionPreviewUI";
import ThemeProvider from "@components/ThemeProvider";
import ThemeStylesProvider from "@components/ThemeStylesProvider";
import CONST from "@src/CONST";
import type TransactionPreviewProps from "@src/types/TransactionPreviewUI.type";
import iconImage from "@assets/images/icon.png";
import type { ThumbnailAndImageURI } from "@libs/ReceiptUtils";
import type { LocaleContextProps } from "@components/LocaleContextProvider";

type TransactionPreviewStory = StoryFn<typeof TransactionPreview>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TransactionPreview> = {
    title: 'Components/TransactionPreview',
    component: TransactionPreview,
};

const fakeTranslate = (text: string, options?: {amount: string})  => {
    switch (text) {
      case 'iou.pendingConversionMessage':
        return 'test1';
      case 'iou.yourSplit':
        return `test2 ${options?.amount}`;
      case 'violations.keepThisOne':
        return 'test3';
      default:
        return 'idk';
    }
  };

const fakeData: TransactionPreviewProps = {
  pendingAction: undefined,
  walletTermsErrors: undefined,
  containerStyles: undefined,
  offlineWithFeedbackOnClose(): void {
  },
  isDeleted: false,
  isScanning: false,
  isWhisper: false,
  isHovered: false,
  shouldShowSkeleton: false,
  isSettled: false,
  isPartialHold: false,
  category: 'Grocery stores',
  isBillSplit: false,
  shouldShowRBR: false,
  isApproved: true,
  shouldShowKeepButton: false,
  displayAmount: '$60.00',
  shouldDisableOnPress: false,
  showCashOrCard: 'lmao',
  isSettlementOrApprovalPartial: false,
  isReviewDuplicateTransactionPage: false,
  shouldShowDescription: true,
  shouldShowMerchant: true,
  shouldShowCategory: true,
  tag: 'New Jersey Office',
  requestAmount: 123,
  sortedParticipantAvatars: [],
  merchantOrDescription: 'Acme',
  shouldShowTag: true,
  shouldShowPendingConversionMessage: true,
  isCurrentUserManager: false,
  splitShare: 0,
  requestCurrency: 'PLN',
  pendingMessageProps: ((blad = false) => {
    if (blad) {return {shouldShow: true, messageIcon: Hourglass, messageDescription: 'problem'}}
    return {shouldShow: false}
  })(),
  showContextMenu: () => undefined,
  previewHeaderText: `Jan 21 ${CONST.DOT_SEPARATOR} Cash`,
  translate: fakeTranslate as LocaleContextProps['translate'],
  navigateToReviewFields: () => undefined,
  onPreviewPressed: () => undefined,
  receiptImages: [
    {
      'thumbnail': iconImage,
      "isEmptyReceipt": true,
      "transaction": {
        "amount": 1234,
        "bank": "",
        "billable": false,
        "cardID": 0,
        "cardName": "Cash Expense",
        "cardNumber": "",
        "category": "",
        "comment": {
          "comment": ""
        },
        "created": "2025-02-14",
        "currency": "PLN",
        "filename": "",
        "inserted": "2025-02-14 08:12:19",
        "managedCard": false,
        "merchant": "(none)",
        "modifiedAmount": 0,
        "modifiedCreated": "",
        "modifiedCurrency": "",
        "modifiedMerchant": "",
        "originalAmount": 0,
        "originalCurrency": "",
        "parentTransactionID": "",
        "posted": "",
        "receipt": {},
        "reimbursable": true,
        "reportID": "795181802749855",
        "status": "Posted",
        "tag": "",
        "transactionID": "6822762180021829710",
        "hasEReceipt": false,
      }
    }
  ] as ThumbnailAndImageURI[]
};

function Template() {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return (
    <ThemeProvider theme={CONST.THEME.LIGHT}>
      <ThemeStylesProvider>
        <View style={{height: '100vh'}}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <TransactionPreview {...fakeData} />
        </View>
      </ThemeStylesProvider>
    </ThemeProvider>
);
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: TransactionPreviewStory = Template.bind({});


export default story;
export { Default };
