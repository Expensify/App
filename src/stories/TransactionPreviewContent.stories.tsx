import type {InputType} from '@storybook/csf';
import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {View} from 'react-native';
import TransactionPreviewContent from '@components/ReportActionItem/TransactionPreview/TransactionPreviewContent';
import type {TransactionPreviewContentProps} from '@components/ReportActionItem/TransactionPreview/types';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {action, chatReport, iouReport, personalDetails, transaction, violations} from './mockData/transactions';

const veryLongString = 'W'.repeat(1000);
const veryBigNumber = Number('9'.repeat(12));
const modifiedTransaction = ({category, tag, merchant = '', amount = 1000, hold = false}: {category?: string; tag?: string; merchant?: string; amount?: number; hold?: boolean}) => ({
    ...transaction,
    category,
    tag,
    merchant,
    amount,
    comment: {
        hold: hold ? 'true' : undefined,
    },
});
const iouReportWithModifiedType = (type: string) => ({...iouReport, type});
const actionWithModifiedPendingAction = (pendingAction: PendingAction) => ({...action, pendingAction});

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
    Food: modifiedTransaction({category: 'Food', tag: 'Yummm', merchant: 'Burgers'}),
    Grocery: modifiedTransaction({category: 'Shopping', tag: 'Tesco', merchant: 'Supermarket'}),
    Cars: modifiedTransaction({category: 'Porsche', tag: 'Car shop', merchant: 'Merchant'}),
    'Too Long': modifiedTransaction({category: veryLongString, tag: veryLongString, merchant: veryLongString, amount: veryBigNumber}),
};

const violationsMap = {
    None: [],
    Duplicate: [violations.at(0)],
    'Missing Category': [violations.at(1)],
    'Field Required': [violations.at(2)],
};

const actionMap = {
    'Pending delete': actionWithModifiedPendingAction(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    'No pending action': action,
};

const iouReportMap = {
    IOU: iouReportWithModifiedType(CONST.REPORT.TYPE.IOU),
    'Normal report': iouReport,
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
        action,
        isWhisper: false,
        isHovered: false,
        chatReport,
        personalDetails,
        iouReport,
        transaction,
        violations: [],
        showContextMenu: () => undefined,
        offlineWithFeedbackOnClose(): void {},
        navigateToReviewFields: () => undefined,
        onPreviewPressed: () => true,
        containerStyles: [],
        isBillSplit: false,
        areThereDuplicates: false,
        sessionAccountID: 11111111,
        walletTermsErrors: undefined,
        routeName: SCREENS.TRANSACTION_DUPLICATE.REVIEW,
        shouldHideOnDelete: false,
        wrapperStyles: {width: 256},
    },
    argTypes: {
        ...disabledProperties,
        iouReport: generateArgTypes(iouReportMap),
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
const KeepButtonIOURBRCategoriesAndTag: TransactionPreviewStory = Template.bind({});

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
    violations,
    transaction: modifiedTransaction({...storiesTransactionData, hold: true}),
};

KeepButtonSplitRBRCategoriesAndTag.args = {
    ...KeepButtonRBRCategoriesAndTag.args,
    isBillSplit: true,
};

KeepButtonIOURBRCategoriesAndTag.args = {
    ...KeepButtonRBRCategoriesAndTag.args,
    iouReport: iouReportWithModifiedType(CONST.REPORT.TYPE.IOU),
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
    KeepButtonIOURBRCategoriesAndTag,
    KeepButtonSplitRBRCategoriesAndTag,
    DeletedKeepButtonSplitRBRCategoriesAndTag,
};
