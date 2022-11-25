import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import PopoverMenu from '../components/PopoverMenu';
import * as Expensicons from '../components/Icon/Expensicons';
import MenuItem from '../components/MenuItem';
import themeColors from '../styles/themes/default';

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
            <MenuItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...args.menuItem}
                onPress={toggleVisibility}
                wrapperStyle={isVisible ? [{backgroundColor: themeColors.border}] : []}
            />
            <SafeAreaProvider>
                <PopoverMenu
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...args.popoverMenu}
                    isVisible={isVisible}
                    onClose={toggleVisibility}
                    onItemSelected={toggleVisibility}
                    menuItems={[
                        {
                            text: 'Bank account',
                            icon: Expensicons.Bank,
                            onSelected: toggleVisibility,
                        },
                        {
                            text: 'Debit card',
                            icon: Expensicons.CreditCard,
                            onSelected: toggleVisibility,
                        },
                        {
                            text: 'PayPal.me',
                            icon: Expensicons.PayPal,
                            onSelected: toggleVisibility,
                        },
                    ]}
                />
            </SafeAreaProvider>
        </>
    );
};

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    popoverMenu: {
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
