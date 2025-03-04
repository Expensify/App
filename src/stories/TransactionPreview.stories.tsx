import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import type {ImageSourcePropType} from 'react-native';
import {View} from 'react-native';
import avatarIcon from '@assets/images/transactionPreviewAvatar.png';
import previewIcon2 from '@assets/images/transactionPreviewIcon2.png';
import previewIcon from '@assets/images/transactionPreviewIcon.png';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview/TransactionPreviewContentUI';
import type {TransactionPreviewUIProps} from '@components/ReportActionItem/TransactionPreview/types';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import type {ThumbnailAndImageURI} from '@libs/ReceiptUtils';
import CONST from '@src/CONST';

const generateReceiptImage = (thumbnail: ImageSourcePropType) =>
    ({
        thumbnail,
        isEmptyReceipt: true,
        transaction: {
            amount: 1234,
            bank: '',
            billable: false,
            cardID: 0,
            cardName: 'Cash Expense',
            cardNumber: '',
            category: '',
            comment: {
                comment: '',
            },
            created: '2025-02-14',
            currency: 'PLN',
            filename: '',
            inserted: '2025-02-14 08:12:19',
            managedCard: false,
            merchant: '(none)',
            modifiedAmount: 0,
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            originalAmount: 0,
            originalCurrency: '',
            parentTransactionID: '',
            posted: '',
            receipt: {},
            reimbursable: true,
            reportID: '111111111111111',
            status: 'Posted',
            tag: '',
            transactionID: '1111111111111111111',
            hasEReceipt: false,
        },
    } as ThumbnailAndImageURI);

const generateAvatars = (count: number) =>
    new Array(count).fill(0).map((_, i) => ({
        id: i.toString().repeat(8),
        source: avatarIcon,
        type: 'avatar',
        name: `qwerty${i}@xyz.com`,
    }));

const isArrayOfThumbnails = (thumbnail: ImageSourcePropType | ImageSourcePropType[]): thumbnail is ImageSourcePropType[] => typeof thumbnail !== 'string';

const generateReceiptImages = (thumbnails: ImageSourcePropType | ImageSourcePropType[]) => {
    if (!isArrayOfThumbnails(thumbnails)) {
        return [generateReceiptImage(thumbnails)];
    }
    return thumbnails.map((thumbnail) => generateReceiptImage(thumbnail));
};

const generateFakeData = (
    amount: string,
    tag: string,
    merchantOrDescription: string,
    date: string,
    thumbnail: ImageSourcePropType | ImageSourcePropType[],
    category: string,
    type: string,
    RBRmessage?: string,
    isBillSplit = false,
    isDeleted = false,
    shouldShowKeepButton = false,
) => ({
    previewHeaderText: `${date} ${CONST.DOT_SEPARATOR} ${type}`,
    merchantOrDescription,
    tag,
    displayAmount: amount,
    category,
    isBillSplit,
    splitShare: 10000,
    requestCurrency: 'USD',
    isDeleted,
    shouldShowSkeleton: false,
    shouldShowKeepButton,
    shouldShowRBR: !!RBRmessage,
    RBRmessage,
    // this is stale in Storybook UI, but is in this function to generate different images on first render
    receiptImages: generateReceiptImages(thumbnail),
});

const staleFakeData = {
    translate: ((value: string, options?: {amount: string}) => {
        if (value === 'violations.keepThisOne') {
            return 'Keep this one';
        }
        return `Your split ${options?.amount}`;
    }) as LocaleContextProps['translate'],
    navigateToReviewFields: () => undefined,
    onPreviewPressed: () => true,
    showContextMenu: () => undefined,
    offlineWithFeedbackOnClose(): void {},
    pendingAction: undefined,
    walletTermsErrors: undefined,
    requestAmount: 100,
    shouldShowTag: true,
    showCashOrCard: '',
    isScanning: false,
    isWhisper: false,
    isHovered: false,
    isSettled: false,
    isApproved: false,
    shouldDisableOnPress: false,
    isSettlementOrApprovalPartial: false,
    isReviewDuplicateTransactionPage: true,
    shouldShowDescription: true,
    shouldShowMerchant: true,
    shouldShowCategory: true,
    sortedParticipantAvatars: generateAvatars(20),
    containerStyles: [{margin: 10}],
};

const disabledProperties = Object.keys(staleFakeData).reduce<Record<string, {table: {disable: boolean}}>>(
    (storyProperties, fakeDataKey) => {
        // eslint-disable-next-line no-param-reassign
        storyProperties[fakeDataKey] = {
            table: {
                disable: true,
            },
        };
        return storyProperties;
    },
    {receiptImages: {table: {disable: true}}},
);

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
                arg: 'isBillSplit',
            },
        },
        splitShare: {
            control: 'number',
            if: {
                arg: 'isBillSplit',
            },
        },
        RBRmessage: {
            control: 'text',
            if: {
                arg: 'shouldShowRBR',
            },
        },
    },
};

function Template(props: TransactionPreviewUIProps) {
    return (
        <ThemeProvider theme={CONST.THEME.LIGHT}>
            <ThemeStylesProvider>
                <View style={{flexDirection: 'row'}}>
                    {/* eslint-disable react/jsx-props-no-spreading */}
                    <TransactionPreview
                        {...staleFakeData}
                        {...props}
                    />
                    {/* eslint-enable react/jsx-props-no-spreading */}
                </View>
            </ThemeStylesProvider>
        </ThemeProvider>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: TransactionPreviewStory = Template.bind({});
const SplitAndKeepButton: TransactionPreviewStory = Template.bind({});
const MoreThan1ImageAndRBR: TransactionPreviewStory = Template.bind({});
const MoreThan1ImageAndSplit: TransactionPreviewStory = Template.bind({});
const DeletedSplitWithRBRAndKeepButton: TransactionPreviewStory = Template.bind({});

Default.args = {
    ...generateFakeData('$60.00', 'New Jersey Office', 'Acme', 'Nov 19', previewIcon, 'Grocery stores', 'Cash'),
};

SplitAndKeepButton.args = {
    ...generateFakeData('$40.00', 'New Jersey Office', 'Wawa', 'Nov 19', previewIcon2, 'Gas stations', 'Split', undefined, true, false, true),
};

MoreThan1ImageAndRBR.args = {
    ...generateFakeData('2000.00€', 'Cracow', 'Orlen', 'Jan 21', new Array(10).fill(previewIcon), 'Gas stations', 'Card', 'Duplicate'),
};

MoreThan1ImageAndSplit.args = {
    ...generateFakeData('14000.00¥', 'Starbucks', 'Coffee', 'Feb 26', new Array(10).fill(previewIcon), 'Food', 'Split', undefined, true),
};

DeletedSplitWithRBRAndKeepButton.args = {
    ...generateFakeData('$1000.00', 'Nowhere', 'Bad', 'Dec 10', previewIcon, 'No existent', 'Split', 'Generic error', true, true, true),
};

export default story;
export {Default, SplitAndKeepButton, MoreThan1ImageAndRBR, MoreThan1ImageAndSplit, DeletedSplitWithRBRAndKeepButton};
