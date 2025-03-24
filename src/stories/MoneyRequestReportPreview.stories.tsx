import type {StoryFn} from '@storybook/react/*';
import React from 'react';
import type {ListRenderItem, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import MoneyRequestReportPreviewContent from '@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContent';
import type {MoneyRequestReportPreviewContentProps} from '@components/ReportActionItem/MoneyRequestReportPreview/types';
import Text from '@components/Text';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import {action, chatReport, iouReport, transaction, violations} from './mockData/transactions';

/* eslint-disable react/jsx-props-no-spreading */

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */

const mockTransactionsMedium = Array.from({length: 6}).map((item, index) => {
    return {...transaction, transactionID: `${index}`};
});

const mockTransactionsBig = Array.from({length: 12}).map((item, index) => {
    return {...transaction, transactionID: `${index}`};
});

const moneyRequestPreviewBox: StyleProp<ViewStyle> = {
    backgroundColor: 'transparent',
    borderRadius: variables.componentBorderRadiusLarge,
    maxWidth: variables.reportPreviewMaxWidth,
    height: 280,
    width: 300,
    borderWidth: 1,
    borderBlockColor: 'black',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
};

const mockRenderItem: ListRenderItem<Transaction> = ({item}) => (
    <View style={moneyRequestPreviewBox}>
        <Text>This is a TransactionPreview</Text>
        <Text>
            for {item.amount} {item.currency}
        </Text>
    </View>
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
        chceckIfContextMenuActive: {
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
            options: [true, false, undefined],
            control: {type: 'radio'},
        },
    },
    args: {
        action,
        chatReport,
        policy: undefined,
        iouReport,
        transactions: mockTransactionsMedium,
        violations,
        invoiceReceiverPersonalDetail: undefined,
        invoiceReceiverPolicy: undefined,
        renderItem: mockRenderItem,
    },
    parameters: {
        useLightTheme: true,
    },
};

function Template(props: MoneyRequestReportPreviewContentProps, {parameters}: {parameters: {useLightTheme?: boolean; transactionsBig?: boolean}}) {
    const theme = parameters.useLightTheme ? CONST.THEME.LIGHT : CONST.THEME.DARK;
    const transactions = parameters.transactionsBig ? mockTransactionsBig : props.transactions;

    return (
        <ThemeProvider theme={theme}>
            <ThemeStylesProvider>
                <View style={{maxWidth: '100%'}}>
                    <MoneyRequestReportPreviewContent
                        {...props}
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
const ManyTransactions: MoneyRequestReportPreviewStory = Template.bind({});
const HasErrors: MoneyRequestReportPreviewStory = Template.bind({});
const ButtonVisible: MoneyRequestReportPreviewStory = Template.bind({});

DarkTheme.parameters = {
    useLightTheme: false,
};

ManyTransactions.parameters = {
    transactionsBig: true,
};

HasErrors.parameters = {};

ButtonVisible.parameters = {};

export {Default, DarkTheme, ManyTransactions, HasErrors, ButtonVisible};
