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

const generateReceiptImage = (thumbnail: ImageSourcePropType) => (
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
    } as ThumbnailAndImageURI
)

const isArrayOfThumbnails = (thumbnail: ImageSourcePropType | ImageSourcePropType[]): thumbnail is ImageSourcePropType[]  => typeof thumbnail !== "string"

const generateReceiptImages = (thumbnails: ImageSourcePropType | ImageSourcePropType[]) => {
  if (!isArrayOfThumbnails(thumbnails)) {return [generateReceiptImage(thumbnails)];}
  return thumbnails.map(thumbnail => generateReceiptImage(thumbnail));
}

const generateFakeData = (amount: string, tag: string, merchantOrDescription: string, date: string, thumbnail: ImageSourcePropType | ImageSourcePropType[], category: string) => ({
  previewHeaderText: `${date} ${CONST.DOT_SEPARATOR} Cash`,
  merchantOrDescription,
  tag,
  displayAmount: amount,
  category,
  splitShare: 0,
  requestCurrency: 'USD',
  isDeleted: false,
  shouldShowSkeleton: false,
  shouldShowRBR: false,
  // this is stale in Storybook UI, but is in this function to generate different images on first render
  receiptImages: generateReceiptImages(thumbnail),
});

const staleFakeData = {
  translate: ((_: string, options?: {amount: string}) => (`Split ${options?.amount}`)) as LocaleContextProps['translate'],
  navigateToReviewFields: () => undefined,
  onPreviewPressed: () => undefined,
  showContextMenu: () => undefined,
  offlineWithFeedbackOnClose(): void {},
  pendingAction: undefined,
  walletTermsErrors: undefined,
  requestAmount: 123,
  shouldShowTag: true,
  showCashOrCard: '',
  isScanning: false,
  isBillSplit: true,
  isWhisper: false,
  isHovered: false,
  isSettled: false,
  isApproved: true,
  shouldShowKeepButton: false,
  shouldDisableOnPress: false,
  isSettlementOrApprovalPartial: false,
  isReviewDuplicateTransactionPage: false,
  shouldShowDescription: true,
  shouldShowMerchant: true,
  shouldShowCategory: true,
  sortedParticipantAvatars: [],
  containerStyles: [{margin: 10}],
}

const disabledProperties = Object.keys(staleFakeData).reduce<Record<string, {table: {disable: boolean}}>>((storyProperties, fakeDataKey) => {
  // eslint-disable-next-line no-param-reassign
  storyProperties[fakeDataKey] = {
    table: {
      disable: true,
    }
  }
  return storyProperties;
}, {receiptImages: {table: {disable: true}}});

type TransactionPreviewStory = StoryFn<typeof TransactionPreview>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TransactionPreview> = {
  title: 'Components/TransactionPreview',
  component: TransactionPreview,
  argTypes: {
    ...disabledProperties,
    requestCurrency: {
    control: 'select',
      options: ['USD', 'PLN', 'EUR'],
      if: {
        arg: 'splitShare', truthy: true
      }
    }
  }
};


function Template(props: TransactionPreviewUIProps) {
  return (
    <ThemeProvider theme={CONST.THEME.LIGHT}>
      <ThemeStylesProvider>
        <View style={{flexDirection: 'row'}}>
          {/* eslint-disable react/jsx-props-no-spreading */}
            <TransactionPreview {...staleFakeData} {...props} />
          {/* eslint-enable react/jsx-props-no-spreading */}
        </View>
      </ThemeStylesProvider>
    </ThemeProvider>
);
}

const Variant1: TransactionPreviewStory = Template.bind({});
const Variant2: TransactionPreviewStory = Template.bind({});
const MoreThan1Image: TransactionPreviewStory = Template.bind({});

Variant1.args = {
  ...generateFakeData('$60.00', 'New Jersey Office', 'Acme', 'Jan 21', previewIcon, 'Grocery stores')
}

Variant2.args = {
  ...generateFakeData('$40.00', 'New Jersey Office', 'Wawa', 'Nov 19', previewIcon2, 'Gas stations')
}

MoreThan1Image.args = {
  ...generateFakeData('$100.00', 'New Jersey Office', 'Wawa', 'Nov 19', [previewIcon, previewIcon2], 'Gas stations')
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// const Default: TransactionPreviewStory = Template.bind({});

export default story;
export { Variant1, Variant2, MoreThan1Image };
