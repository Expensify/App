import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchColumnType} from '@components/Search/types';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import TransactionItemRow from '@components/TransactionItemRow';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';
import {transactionWithOptionalSearchFields} from './objects/Transaction';

type TransactionItemRowStory = StoryFn<typeof TransactionItemRow>;

const allAvailableColumns = [
    CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
    CONST.SEARCH.TABLE_COLUMNS.TYPE,
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.FROM,
    CONST.SEARCH.TABLE_COLUMNS.TO,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
    CONST.SEARCH.TABLE_COLUMNS.ACTION,
];

type TransactionItemRowProps = {
    transactionItem: Transaction;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    shouldShowCheckbox?: boolean;
    columns?: SearchColumnType[];
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
    {transactionItem, shouldUseNarrowLayout, isSelected, shouldShowTooltip, shouldShowCheckbox, columns}: TransactionItemRowProps,
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
