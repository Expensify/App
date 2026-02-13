import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuProps} from '@components/PopoverMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
// eslint-disable-next-line no-restricted-imports
import themeColors from '@styles/theme/themes/dark';

type PopoverMenuStory = StoryFn<typeof PopoverMenu>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof PopoverMenu> = {
    title: 'Components/PopoverMenu',
    component: PopoverMenu,
};

function Template(props: PopoverMenuProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const icons = useMemoizedLazyExpensifyIcons(['Bank', 'CreditCard']);
    return (
        <>
            <MenuItem
                title="Add payment Methods"
                icon={Expensicons.Plus}
                onPress={toggleVisibility}
                wrapperStyle={isVisible ? [{backgroundColor: themeColors.border}] : []}
            />
            <SafeAreaProvider>
                <PopoverMenu
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    isVisible={isVisible}
                    onClose={toggleVisibility}
                    onItemSelected={toggleVisibility}
                    menuItems={[
                        {
                            text: 'Bank account',
                            icon: icons.Bank,
                            onSelected: toggleVisibility,
                        },
                        {
                            text: 'Debit card',
                            icon: icons.CreditCard,
                            onSelected: toggleVisibility,
                        },
                    ]}
                />
            </SafeAreaProvider>
        </>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: PopoverMenuStory = Template.bind({});
Default.args = {
    anchorPosition: {
        vertical: 80,
        horizontal: 20,
    },
};

export default story;
export {Default};
