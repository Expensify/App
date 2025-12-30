import type {StoryFn} from '@storybook/react-webpack5';
import React, {useMemo} from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {ButtonWithDropdownMenuProps} from '@components/ButtonWithDropdownMenu/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

type ButtonWithDropdownMenuStory = StoryFn<typeof ButtonWithDropdownMenu>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/ButtonWithDropdownMenu',
    component: ButtonWithDropdownMenu,
};

function Template(props: ButtonWithDropdownMenuProps<unknown>) {
    const icons = useMemoizedLazyExpensifyIcons(['Wallet']);

    const options = useMemo(
        () => [
            {value: 'One', text: 'One', icon: icons.Wallet},
            {value: 'Two', text: 'Two', icon: icons.Wallet},
        ],
        [icons.Wallet],
    );

    return (
        <ButtonWithDropdownMenu
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            options={options}
        />
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: ButtonWithDropdownMenuStory = Template.bind({});
Default.args = {
    customText: 'Pay with Expensify',
    onPress: (e, item) => {
        alert(`Button ${item as string} is pressed.`);
    },
    pressOnEnter: true,
};

export default story;
export {Default};
