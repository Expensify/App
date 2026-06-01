import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import TextInputWithSymbol from '@components/TextInputWithSymbol';
import CONST from '@src/CONST';

type TextInputWithSymbolStory = StoryFn<typeof TextInputWithSymbol>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TextInputWithSymbol> = {
    title: 'Forms/TextInputWithSymbol',
    component: TextInputWithSymbol,
};

function Template(props: React.ComponentProps<typeof TextInputWithSymbol>) {
    const [amount, setAmount] = useState(props.formattedAmount);
    return (
        <TextInputWithSymbol
            {...props}
            formattedAmount={amount}
            onChangeAmount={setAmount}
        />
    );
}

const PrefixSymbol: TextInputWithSymbolStory = Template.bind({});
PrefixSymbol.args = {
    formattedAmount: '',
    placeholder: '0.00',
    symbol: '$',
    symbolPosition: CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX,
    isSymbolPressable: false,
    disableKeyboard: false,
};

const SuffixSymbol: TextInputWithSymbolStory = Template.bind({});
SuffixSymbol.args = {
    formattedAmount: '',
    placeholder: '0',
    symbol: 'km',
    symbolPosition: CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX,
    isSymbolPressable: false,
    disableKeyboard: false,
};

export default story;
export {PrefixSymbol, SuffixSymbol};
