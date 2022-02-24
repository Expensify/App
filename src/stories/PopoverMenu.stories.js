import React from 'react';
import PopoverMenu from '../components/PopoverMenu';
import * as Expensicons from '../components/Icon/Expensicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MenuItem from '../components/MenuItem';
import colors from '../styles/colors';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/PopoverMenu',
    component: PopoverMenu,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = (args) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    return (
        <>
            <MenuItem {...args.menuItem} onPress={toggleVisibility} wrapperStyle={isVisible ? [{backgroundColor: colors.gray2}] : []} />
            <SafeAreaProvider>
                <PopoverMenu {...args.popoverMenu} isVisible={isVisible} onClose={toggleVisibility} />
            </SafeAreaProvider>
        </>
    );
};

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    popoverMenu: {
        menuItems: [
            {
                text: 'Bank account',
                icon: Expensicons.Bank,
            },
            {
                text: 'Debit card',
                icon: Expensicons.CreditCard,
            },
            {
                text: 'PayPal.me',
                icon: Expensicons.PayPal,
            },
        ],
        anchorPosition: {
            top: 80,
            left: 20,
        },
    },
    menuItem: {
        title: 'Add payment Methods',
        icon: Expensicons.Plus,
    },
};

export default story;
export {
    Default,
};