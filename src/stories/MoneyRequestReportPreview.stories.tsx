import MoneyRequestReportPreviewContent from '@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContent';
import type {MoneyRequestReportPreviewContentProps} from '@components/ReportActionItem/MoneyRequestReportPreview/types';
import TransactionPreviewContent from '@components/ReportActionItem/TransactionPreview/TransactionPreviewContent';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

import type {ListRenderItem} from '@shopify/flash-list';
import type {StoryFn} from '@storybook/react-webpack5';
import type {LayoutChangeEvent} from 'react-native';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

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
    },
    parameters: {
        useLightTheme: true,
    },
};

function Template(props: MoneyRequestReportPreviewContentProps, {parameters}: {parameters: {useLightTheme?: boolean; transactionsBig?: boolean}}) {
    const theme = parameters.useLightTheme ? CONST.THEME.LIGHT : CONST.THEME.DARK;
    const transactions = parameters.transactionsBig ? mockTransactionsBig : props.transactions;

    const widthsRef = useRef<{currentWidth: number | null; currentWrapperWidth: number | null}>({currentWidth: null, currentWrapperWidth: null});
    const [widths, setWidths] = useState({currentWidth: 0, currentWrapperWidth: 0});

    const updateWidths = () => {
        const {currentWidth, currentWrapperWidth} = widthsRef.current;

        if (currentWidth && currentWrapperWidth) {
            setWidths({currentWidth, currentWrapperWidth});
        }
    };

    const onCarouselLayout = (e: LayoutChangeEvent) => {
        const newWidth = e.nativeEvent.layout.width;
        if (widthsRef.current.currentWidth !== newWidth) {
            widthsRef.current.currentWidth = newWidth;
            updateWidths();
        }
    };

    const onWrapperLayout = (e: LayoutChangeEvent) => {
        const newWrapperWidth = e.nativeEvent.layout.width;
        if (widthsRef.current.currentWrapperWidth !== newWrapperWidth) {
            widthsRef.current.currentWrapperWidth = newWrapperWidth;
            updateWidths();
        }
    };

    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(false, transactions.length, widths.currentWidth, widths.currentWrapperWidth);
    const transactionPreviewContainerStyles = [styles.h100, reportPreviewStyles.transactionPreviewCarouselStyle];

    const renderItem: ListRenderItem<Transaction> = ({item}) => (
        <TransactionPreviewContent
            action={actionR14932}
            isWhisper={false}
            isHovered={false}
            chatReport={chatReportR14932}
            personalDetails={personalDetails}
            report={iouReportR14932}
            policy={undefined}
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
            transactionPreviewWidth={reportPreviewStyles.transactionPreviewCarouselStyle.width}
            containerStyles={transactionPreviewContainerStyles}
        />
    );

    return (
        <ThemeProvider theme={theme}>
            <ThemeStylesProvider>
                <View style={{maxWidth: '100%'}}>
                    <MoneyRequestReportPreviewContent
                        {...props}
                        reportPreviewStyles={reportPreviewStyles}
                        containerStyles={[reportPreviewStyles.componentStyle, props.containerStyles]}
                        transactions={transactions}
                        onCarouselLayout={onCarouselLayout}
                        onWrapperLayout={onWrapperLayout}
                        currentWidth={widths.currentWidth}
                        renderTransactionItem={renderItem}
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
