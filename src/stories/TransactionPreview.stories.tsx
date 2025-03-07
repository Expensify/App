import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {View} from 'react-native';
import type {InputType} from 'storybook/internal/types';
import type {TupleToUnion} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview/TransactionPreviewContentUI';
import type {TransactionPreviewUIProps} from '@components/ReportActionItem/TransactionPreview/types';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import type {ThumbnailAndImageURI} from '@libs/ReceiptUtils';
import CONST from '@src/CONST';
import type {SearchPersonalDetails} from '@src/types/onyx/SearchResults';

const availableColors = ['pink', 'yellow', 'navy', 'blue', 'green', 'tangerine'];
const availableUsers = ['John Smith', 'Jane Doe', 'Ted Kowalski'];
type BGColor = TupleToUnion<typeof availableColors>;

const generateReceiptImage = (color: BGColor): ThumbnailAndImageURI => ({
    thumbnail: `static/media/assets/images/eReceiptBGs/eReceiptBG_${color}.png`,
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
});

const generateAvatars = (count: number) =>
    new Array(count).fill(0).map((_, i) => ({
        id: i.toString().repeat(8),
        source: `@assets/images/avatars/user/default-avatar_${(i + 1) % 24}.svg`,
        type: 'avatar',
        name: `qwerty${i}@xyz.com`,
    }));

const generateReceiptImages = (colors: BGColor | BGColor[]) => {
    if (typeof colors === 'string') {
        return [generateReceiptImage(colors)];
    }
    return colors.map((color) => generateReceiptImage(color));
};

const usersMap = availableUsers.reduce<Record<string, {displayName: string; avatar: string}>>((mappings, user, index) => {
    // eslint-disable-next-line no-param-reassign
    mappings[user] = {
        displayName: user,
        avatar: `@assets/images/avatars/user/default-avatar_${(index + 1) % 24}.svg`,
    };
    return mappings;
}, {});

const receiptImagesMap = availableColors.reduce<Record<string, ThumbnailAndImageURI[]>>((mappings, color) => {
    // eslint-disable-next-line no-param-reassign
    mappings[color] = generateReceiptImages(color);
    return mappings;
}, {});

const generateProps = (
    amount: string,
    tag: string,
    merchantOrDescription: string,
    date: string,
    colors: BGColor | BGColor[],
    category: string,
    type: string,
    RBRmessage?: string,
    isBillSplit = false,
    isDeleted = false,
    shouldShowKeepButton = false,
    isIOU = false,
    participants?: [string, string],
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
    receiptImages: generateReceiptImages(colors),
    isIOU,
    from: participants ? (usersMap[participants[0]] as SearchPersonalDetails) : undefined,
    to: participants ? (usersMap[participants[1]] as SearchPersonalDetails) : undefined,
});

const staticProps = {
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

const disabledProperties = Object.keys(staticProps).reduce<Record<string, {table: {disable: boolean}}>>((storyProperties, fakeDataKey) => {
    // eslint-disable-next-line no-param-reassign
    storyProperties[fakeDataKey] = {
        table: {
            disable: true,
        },
    };
    return storyProperties;
}, {});

type TransactionPreviewStory = StoryFn<typeof TransactionPreview>;

const usersArgType: InputType = {
    options: availableUsers,
    mapping: usersMap,
    control: 'select',
    if: {
        arg: 'isIOU',
    },
};

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
        receiptImages: {
            mapping: receiptImagesMap,
            options: availableColors,
            control: 'select',
        },
        from: usersArgType,
        to: usersArgType,
    },
};

function Template(props: TransactionPreviewUIProps) {
    return (
        <ThemeProvider theme={CONST.THEME.LIGHT}>
            <ThemeStylesProvider>
                <View style={{flexDirection: 'row'}}>
                    {/* eslint-disable react/jsx-props-no-spreading */}
                    <TransactionPreview
                        {...staticProps}
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
const IOUWithKeepButton: TransactionPreviewStory = Template.bind({});

Default.args = {
    ...generateProps('$60.00', 'New Jersey Office', 'Acme', 'Nov 19', 'blue', 'Grocery stores', 'Cash'),
};

SplitAndKeepButton.args = {
    ...generateProps('$40.00', 'New Jersey Office', 'Wawa', 'Nov 19', 'pink', 'Gas stations', 'Split', undefined, true, false, true),
};

MoreThan1ImageAndRBR.args = {
    ...generateProps('2000.00€', 'Cracow', 'Orlen', 'Jan 21', new Array(10).fill('tangerine'), 'Gas stations', 'Card', 'Duplicate'),
};

MoreThan1ImageAndSplit.args = {
    ...generateProps('14000.00¥', 'Starbucks', 'Coffee', 'Feb 26', new Array(10).fill('yellow'), 'Food', 'Split', undefined, true),
};

DeletedSplitWithRBRAndKeepButton.args = {
    ...generateProps('$1000.00', 'Nowhere', 'Bad', 'Dec 10', 'navy', 'No existent', 'Split', 'Generic error', true, true, true),
};

IOUWithKeepButton.args = {
    ...generateProps('$50000.00', 'Somewhere', 'I Owe You', 'Jul 20', 'green', 'Debts', 'Card', undefined, false, false, true, true, ['John Smith', 'Jane Doe']),
};

export default story;
export {Default, SplitAndKeepButton, MoreThan1ImageAndRBR, MoreThan1ImageAndSplit, DeletedSplitWithRBRAndKeepButton, IOUWithKeepButton};
