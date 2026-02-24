import type {StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import type {ListRenderItem} from 'react-native';
import {View} from 'react-native';
import MoneyRequestReportPreviewContent from '@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContent';
import type {MoneyRequestReportPreviewContentProps} from '@components/ReportActionItem/MoneyRequestReportPreview/types';
import TransactionPreviewContent from '@components/ReportActionItem/TransactionPreview/TransactionPreviewContent';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
// eslint-disable-next-line no-restricted-imports
import getMoneyRequestReportPreviewStyle from '@styles/utils/getMoneyRequestReportPreviewStyle';
// eslint-disable-next-line no-restricted-imports
import sizing from '@styles/utils/sizing';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import {actionR14932} from '../../__mocks__/reportData/actions';
import personalDetails from '../../__mocks__/reportData/personalDetails';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import {transactionR14932} from '../../__mocks__/reportData/transactions';
import {receiptErrorsR14932, violationsR14932} from '../../__mocks__/reportData/violations';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */

const mockTransactionsMedium = Array.from({length: 2}).map((item, index) => {
    return {...transactionR14932, transactionID: `${transactionR14932.transactionID}${index}`};
});

const mockTransactionsBig = Array.from({length: 12}).map((item, index) => {
    return {...transactionR14932, transactionID: `${transactionR14932.transactionID}${index}`};
});

const mockRenderItem: ListRenderItem<Transaction> = ({item}) => (
    <TransactionPreviewContent
        action={actionR14932}
        isWhisper={false}
        isHovered={false}
        chatReport={chatReportR14932}
        personalDetails={personalDetails}
        report={iouReportR14932}
        transaction={item}
        transactionRawAmount={item.amount}
        violations={item.errors ? violationsR14932 : []}
        offlineWithFeedbackOnClose={() => undefined}
        navigateToReviewFields={() => undefined}
        isBillSplit={false}
        areThereDuplicates={false}
        sessionAccountID={11111111}
        walletTermsErrors={undefined}
        routeName={SCREENS.TRANSACTION_DUPLICATE.REVIEW}
        shouldHideOnDelete={false}
        transactionPreviewWidth={303}
        containerStyles={[sizing.h100]}
    />
);

type MoneyRequestReportPreviewStory = StoryFn<typeof MoneyRequestReportPreviewContent>;

export default {
    title: 'Components/MoneyRequestReportPreviewContent',
    component: MoneyRequestReportPreviewContent,
    argTypes: {
        /** The associated chatReport */
        chatReportID: {
            options: ['chatReportID', undefined],
            control: {type: 'radio'},
        },
        /** The active IOUReport, used for Onyx subscription */
        iouReportID: {
            options: ['iouReportID', undefined],
            control: {type: 'radio'},
        },
        /** The report's policyID, used for Onyx subscription */
        policyID: {
            options: ['policyID', undefined],
            control: {type: 'radio'},
        },
        /** Extra styles to pass to View wrapper */
        containerStyles: {
            options: [{marginTop: 8}],
            control: {type: 'radio'},
        },
        /** Popover context menu anchor, used for showing context menu */
        contextMenuAnchor: {
            options: [null],
            control: {type: 'radio'},
        },
        /** Callback for updating context menu active state, used for showing context menu */
        checkIfContextMenuActive: {
            options: [undefined, () => {}],
            control: {type: 'radio'},
        },
        /** Callback when the payment options popover is shown */
        onPaymentOptionsShow: {
            options: [undefined, () => {}],
            control: {type: 'radio'},
        },
        /** Callback when the payment options popover is closed */
        onPaymentOptionsHide: {
            options: [undefined, () => {}],
            control: {type: 'radio'},
        },
        /** Whether a message is a whisper */
        isWhisper: {
            options: [true, false, undefined],
            control: {type: 'radio'},
        },
        /** Whether the corresponding report action item is hovered */
        isHovered: {
            control: {type: 'boolean'},
        },
    },
    args: {
        action: actionR14932,
        chatReport: chatReportR14932,
        policy: undefined,
        iouReport: iouReportR14932,
        transactions: mockTransactionsMedium,
        violations: violationsR14932,
        invoiceReceiverPersonalDetail: undefined,
        invoiceReceiverPolicy: undefined,
        renderTransactionItem: mockRenderItem,
    },
    parameters: {
        useLightTheme: true,
    },
};

function Template(props: MoneyRequestReportPreviewContentProps, {parameters}: {parameters: {useLightTheme?: boolean; transactionsBig?: boolean}}) {
    const theme = parameters.useLightTheme ? CONST.THEME.LIGHT : CONST.THEME.DARK;
    const transactions = parameters.transactionsBig ? mockTransactionsBig : props.transactions;
    const reportPreviewStyle = getMoneyRequestReportPreviewStyle(false, transactions.length, 400, 400);

    return (
        <ThemeProvider theme={theme}>
            <ThemeStylesProvider>
                <View style={{maxWidth: '100%'}}>
                    <MoneyRequestReportPreviewContent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        reportPreviewStyles={reportPreviewStyle}
                        containerStyles={[reportPreviewStyle.componentStyle, props.containerStyles]}
                        transactions={transactions}
                    />
                </View>
            </ThemeStylesProvider>
        </ThemeProvider>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: MoneyRequestReportPreviewStory = Template.bind({});
const DarkTheme: MoneyRequestReportPreviewStory = Template.bind({});
const OneTransaction: MoneyRequestReportPreviewStory = Template.bind({});
const ManyTransactions: MoneyRequestReportPreviewStory = Template.bind({});
const HasErrors: MoneyRequestReportPreviewStory = Template.bind({});

DarkTheme.parameters = {
    useLightTheme: false,
};

OneTransaction.args = {
    transactions: [transactionR14932],
};

ManyTransactions.parameters = {
    transactionsBig: true,
};

HasErrors.args = {
    transactions: mockTransactionsMedium.map((t) => ({
        ...t,
        errors: receiptErrorsR14932,
    })),
};

export {Default, DarkTheme, ManyTransactions, HasErrors, OneTransaction};
