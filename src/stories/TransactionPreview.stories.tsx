import type { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import type { ImageSourcePropType} from "react-native";
import { View } from "react-native";
import TransactionPreview from "@components/ReportActionItem/TransactionPreview/TransactionPreviewContentUI";
import ThemeProvider from "@components/ThemeProvider";
import ThemeStylesProvider from "@components/ThemeStylesProvider";
import CONST from "@src/CONST";
import type {TransactionPreviewUIProps} from "@components/ReportActionItem/TransactionPreview/types";
import previewIcon from "@assets/images/transactionPreviewIcon.png";
import previewIcon2 from "@assets/images/transactionPreviewIcon2.png";
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
        return 'Pending';
      case 'iou.yourSplit':
        return `Split ${options?.amount}`;
      case 'violations.keepThisOne':
        return 'Keep this one';
      default:
        return 'Default';
    }
  };

const generateFakeData = (amount: string, tag: string, merchantOrDescription: string, date: string, thumbnail: ImageSourcePropType, category: string): TransactionPreviewUIProps => ({
  pendingAction: undefined,
  walletTermsErrors: undefined,
  containerStyles: [{margin: 10}],
  offlineWithFeedbackOnClose(): void {
  },
  isDeleted: false,
  isScanning: false,
  isWhisper: false,
  isHovered: false,
  shouldShowSkeleton: false,
  isSettled: false,
  category,
  isBillSplit: false,
  shouldShowRBR: false,
  isApproved: true,
  shouldShowKeepButton: false,
  displayAmount: amount,
  shouldDisableOnPress: false,
  showCashOrCard: '',
  isSettlementOrApprovalPartial: false,
  isReviewDuplicateTransactionPage: false,
  shouldShowDescription: true,
  shouldShowMerchant: true,
  shouldShowCategory: true,
  tag,
  requestAmount: 123,
  sortedParticipantAvatars: [],
  merchantOrDescription,
  shouldShowTag: true,
  splitShare: 0,
  requestCurrency: 'PLN',
  showContextMenu: () => undefined,
  previewHeaderText: `${date} ${CONST.DOT_SEPARATOR} Cash`,
  translate: fakeTranslate as LocaleContextProps['translate'],
  navigateToReviewFields: () => undefined,
  onPreviewPressed: () => undefined,
  receiptImages: [
    {
      'thumbnail': thumbnail,
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
        "reportID": "111111111111111",
        "status": "Posted",
        "tag": "",
        "transactionID": "1111111111111111111",
        "hasEReceipt": false,
      }
    }
  ] as ThumbnailAndImageURI[]
});


const fakeData1 = generateFakeData('$60.00', 'New Jersey Office', 'Acme', 'Jan 21', previewIcon, 'Grocery stores');
const fakeData2 = generateFakeData('$40.00', 'New Jersey Office', 'Wawa', 'Nov 19', previewIcon2, 'Gas stations');

function Template() {
  return (
    <ThemeProvider theme={CONST.THEME.LIGHT}>
      <ThemeStylesProvider>
        <View style={{flexDirection: 'row'}}>
          {/* eslint-disable react/jsx-props-no-spreading */}
            <TransactionPreview {...fakeData1} />
            <TransactionPreview {...fakeData2} />
          {/* eslint-enable react/jsx-props-no-spreading */}
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
