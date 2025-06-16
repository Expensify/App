import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import type {ValueOf} from 'type-fest';
import ScreenWrapper from '@components/ScreenWrapper';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import TransactionItemRow from '@components/TransactionItemRow';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';
import {transactionWithOptionalSearchFields} from './objects/Transaction';

type TransactionItemRowStory = StoryFn<typeof TransactionItemRow>;

const allAvailableColumns = [
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.TYPE,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.DATE,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.FROM,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.TO,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAG,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.ACTION,
];

type TransactionItemRowProps = {
    transactionItem: Transaction;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    shouldShowCheckbox: boolean;
    columns?: Array<ValueOf<typeof CONST.REPORT.TRANSACTION_LIST.COLUMNS>>;
    isParentHovered?: boolean;
};

const story: Meta<typeof TransactionItemRow> = {
    title: 'Components/TransactionItemRow',
    component: TransactionItemRow,
    args: {
        transactionItem: transactionWithOptionalSearchFields,
        shouldUseNarrowLayout: false,
        isSelected: false,
        shouldShowTooltip: true,
        shouldShowCheckbox: true,
        columns: allAvailableColumns,
    },
    argTypes: {
        transactionItem: {
            control: 'object',
        },
        shouldUseNarrowLayout: {
            control: 'boolean',
        },
        isSelected: {
            control: 'boolean',
        },
        shouldShowTooltip: {
            control: 'boolean',
        },
        shouldShowCheckbox: {
            control: 'boolean',
        },
        isParentHovered: {
            control: 'boolean',
        },

        columns: {
            control: {
                type: 'check',
            },
            options: allAvailableColumns,
        },
    },
    parameters: {
        useLightTheme: true,
    },
};

function Template(
    {transactionItem, shouldUseNarrowLayout, isSelected, shouldShowTooltip, shouldShowCheckbox, columns, isParentHovered}: TransactionItemRowProps,
    {parameters}: {parameters: {useLightTheme?: boolean}},
) {
    const theme = parameters.useLightTheme ? CONST.THEME.LIGHT : CONST.THEME.DARK;

    return (
        <ThemeProvider theme={theme}>
            <ScreenWrapper testID="testID">
                <ThemeStylesProvider>
                    <TransactionItemRow
                        transactionItem={transactionItem}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                        isSelected={isSelected}
                        shouldShowTooltip={shouldShowTooltip}
                        dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                        amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                        taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                        onCheckboxPress={() => {}}
                        shouldShowCheckbox={shouldShowCheckbox}
                        columns={columns}
                        isParentHovered={isParentHovered}
                        onButtonPress={() => {}}
                    />
                </ThemeStylesProvider>
            </ScreenWrapper>
        </ThemeProvider>
    );
}

const LightTheme: TransactionItemRowStory = Template.bind({});
const DarkTheme: TransactionItemRowStory = Template.bind({});

LightTheme.parameters = {
    useLightTheme: true,
};

DarkTheme.parameters = {
    useLightTheme: false,
};

export default story;
export {LightTheme, DarkTheme};
