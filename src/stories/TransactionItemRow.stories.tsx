import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
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
    shouldShowCheckbox: boolean;
};

const story: Meta<typeof TransactionItemRow> = {
    title: 'Components/TransactionItemRow',
    component: TransactionItemRow,
    args: {
        transactionItem: transaction,
        shouldUseNarrowLayout: false,
        isSelected: false,
        shouldShowTooltip: true,
        shouldShowCheckbox: true,
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
    },
    parameters: {
        useLightTheme: true,
    },
};

function Template(
    {transactionItem, shouldUseNarrowLayout, isSelected, shouldShowTooltip, shouldShowCheckbox}: TransactionItemRowProps,
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
                        shouldShowChatBubbleComponent
                        dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                        onCheckboxPress={() => {}}
                        shouldShowCheckbox={shouldShowCheckbox}
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
