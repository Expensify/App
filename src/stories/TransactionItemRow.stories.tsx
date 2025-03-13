import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import TransactionItemRow from '@components/TransactionItemRow';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';
import transaction from './objects/Transaction';

type TransactionItemRowStory = StoryFn<typeof TransactionItemRow>;

type TransactionItemRowProps = {
    transactionItem: Transaction;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
};

const story: Meta<typeof TransactionItemRow> = {
    title: 'Components/TransactionItemRow',
    component: TransactionItemRow,
    args: {
        transactionItem: transaction,
        shouldUseNarrowLayout: false,
        isSelected: false,
        shouldShowTooltip: true,
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
    },
    parameters: {
        useLightTheme: true,
    },
};

function Template({transactionItem, shouldUseNarrowLayout, isSelected, shouldShowTooltip}: TransactionItemRowProps, {parameters}: {parameters: {useLightTheme?: boolean}}) {
    const theme = parameters.useLightTheme ? CONST.THEME.LIGHT : CONST.THEME.DARK;

    return (
        <ThemeProvider theme={theme}>
            <ThemeStylesProvider>
                <TransactionItemRow
                    transactionItem={transactionItem}
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    isSelected={isSelected}
                    shouldShowTooltip={shouldShowTooltip}
                />
            </ThemeStylesProvider>
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
