import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import type {InputType} from 'storybook/internal/csf';
import type {ValueOf} from 'type-fest';
import TransactionPreviewContent from '@components/ReportActionItem/TransactionPreview/TransactionPreviewContent';
import type {TransactionPreviewContentProps} from '@components/ReportActionItem/TransactionPreview/types';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {actionR14932} from '../../__mocks__/reportData/actions';
import personalDetails from '../../__mocks__/reportData/personalDetails';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import {transactionR14932} from '../../__mocks__/reportData/transactions';
import {violationsR14932} from '../../__mocks__/reportData/violations';

const veryLongString = 'W'.repeat(1000);
const veryBigNumber = Number('9'.repeat(12));
const modifiedTransaction = ({category, tag, merchant = '', amount = 1000, hold = false}: {category?: string; tag?: string; merchant?: string; amount?: number; hold?: boolean}) => ({
    ...transactionR14932,
    category,
    tag,
    merchant,
    amount,
    comment: {
        hold: hold ? 'true' : undefined,
    },
});
const iouReportWithModifiedType = (type: ValueOf<typeof CONST.REPORT.TYPE>) => ({...iouReportR14932, type});
const actionWithModifiedPendingAction = (pendingAction: PendingAction) => ({...actionR14932, pendingAction});

const disabledProperties = [
    'onPreviewPressed',
    'navigateToReviewFields',
    'offlineWithFeedbackOnClose',
    'containerStyles',
    'showContextMenu',
    'routeName',
    'sessionAccountID',
    'isHovered',
    'isWhisper',
    'walletTermsErrors',
    'personalDetails',
    'chatReport',
].reduce<Record<string, {table: {disable: boolean}}>>((disabledArgTypes, property) => {
    // eslint-disable-next-line no-param-reassign
    disabledArgTypes[property] = {
        table: {
            disable: true,
        },
    };
    return disabledArgTypes;
}, {});

const generateArgTypes = (mapping: Record<string, unknown>): InputType => ({
    control: 'select',
    options: Object.keys(mapping),
    mapping,
});

/* eslint-disable @typescript-eslint/naming-convention */
const transactionsMap = {
    'No Merchant': modifiedTransaction({}),
    Food: modifiedTransaction({category: 'Food', tag: 'Yum', merchant: 'Burgers'}),
    Grocery: modifiedTransaction({category: 'Shopping', tag: 'Tesco', merchant: 'Supermarket'}),
    Cars: modifiedTransaction({category: 'Porsche', tag: 'Car shop', merchant: 'Merchant'}),
    'Too Long': modifiedTransaction({category: veryLongString, tag: veryLongString, merchant: veryLongString, amount: veryBigNumber}),
};

const violationsMap = {
    None: [],
    Duplicate: [violationsR14932.at(0)],
    'Missing Category': [violationsR14932.at(1)],
    'Field Required': [violationsR14932.at(2)],
};

const actionMap = {
    'Pending delete': actionWithModifiedPendingAction(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    'No pending action': actionR14932,
};

const iouReportMap = {
    IOU: iouReportWithModifiedType(CONST.REPORT.TYPE.IOU),
    'Normal report': iouReportR14932,
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
type TransactionPreviewStory = StoryFn<typeof TransactionPreviewContent>;

const story: Meta<typeof TransactionPreviewContent> = {
    title: 'Components/TransactionPreview',
    component: TransactionPreviewContent,
    args: {
        action: actionR14932,
        isWhisper: false,
        isHovered: false,
        chatReport: chatReportR14932,
        personalDetails,
        report: iouReportR14932,
        transaction: transactionR14932,
        violations: [],
        offlineWithFeedbackOnClose(): void {},
        navigateToReviewFields: () => undefined,
        containerStyles: [],
        isBillSplit: false,
        areThereDuplicates: false,
        sessionAccountID: 11111111,
        walletTermsErrors: undefined,
        routeName: SCREENS.TRANSACTION_DUPLICATE.REVIEW,
        shouldHideOnDelete: false,
        transactionPreviewWidth: 303,
    },
    argTypes: {
        ...disabledProperties,
        report: generateArgTypes(iouReportMap),
        transaction: generateArgTypes(transactionsMap),
        violations: generateArgTypes(violationsMap),
        action: generateArgTypes(actionMap),
    },
};

function Template(props: TransactionPreviewContentProps) {
    return (
        <ThemeProvider theme={CONST.THEME.LIGHT}>
            <ThemeStylesProvider>
                <View style={{flexDirection: 'row'}}>
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <TransactionPreviewContent {...props} />
                </View>
            </ThemeStylesProvider>
        </ThemeProvider>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: TransactionPreviewStory = Template.bind({});
const NoMerchant: TransactionPreviewStory = Template.bind({});
const CategoriesAndTag: TransactionPreviewStory = Template.bind({});
const KeepButtonCategoriesAndTag: TransactionPreviewStory = Template.bind({});
const KeepButtonRBRCategoriesAndTag: TransactionPreviewStory = Template.bind({});
const KeepButtonSplitRBRCategoriesAndTag: TransactionPreviewStory = Template.bind({});
const DeletedKeepButtonSplitRBRCategoriesAndTag: TransactionPreviewStory = Template.bind({});
const KeepButtonIOURbrCategoriesAndTag: TransactionPreviewStory = Template.bind({});

const storiesTransactionData = {category: 'Grocery stores', tag: 'Food', merchant: 'Acme'};

NoMerchant.args = {
    ...Default.args,
    transaction: modifiedTransaction({}),
};

CategoriesAndTag.args = {
    ...Default.args,
    transaction: modifiedTransaction(storiesTransactionData),
};

KeepButtonCategoriesAndTag.args = {
    ...CategoriesAndTag.args,
    areThereDuplicates: true,
};

KeepButtonRBRCategoriesAndTag.args = {
    ...KeepButtonCategoriesAndTag.args,
    violations: violationsR14932,
    transaction: modifiedTransaction({...storiesTransactionData, hold: true}),
};

KeepButtonSplitRBRCategoriesAndTag.args = {
    ...KeepButtonRBRCategoriesAndTag.args,
    isBillSplit: true,
};

KeepButtonIOURbrCategoriesAndTag.args = {
    ...KeepButtonRBRCategoriesAndTag.args,
    report: iouReportWithModifiedType(CONST.REPORT.TYPE.IOU),
};

DeletedKeepButtonSplitRBRCategoriesAndTag.args = {
    ...KeepButtonSplitRBRCategoriesAndTag.args,
    action: actionWithModifiedPendingAction(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
};

export default story;
export {
    Default,
    NoMerchant,
    CategoriesAndTag,
    KeepButtonCategoriesAndTag,
    KeepButtonRBRCategoriesAndTag,
    KeepButtonIOURbrCategoriesAndTag,
    KeepButtonSplitRBRCategoriesAndTag,
    DeletedKeepButtonSplitRBRCategoriesAndTag,
};
