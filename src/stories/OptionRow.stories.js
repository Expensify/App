import React from 'react';
import OptionRow from '../components/OptionRow';
import * as Expensicons from '../components/Icon/Expensicons';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
export default {
    title: 'Components/OptionRow',
    component: OptionRow,
    argTypes: {
        mode: {
            options: ['default', 'compact'],
            control: {type: 'radio'},
        },
    },
    args: {
        mode: 'default',
        optionIsFocused: false,
        showSelectedState: false,
        isSelected: false,
        hideAdditionalOptionStates: false,
        forceTextUnreadStyle: false,
        showTitleTooltip: false,
        isDisabled: false,
        backgroundColor: 'white',
        option: {
            isUnread: false,
            text: 'Test Option',
            alternateText: 'Alternate text',
            icons: [Expensicons.ActiveRoomAvatar],
            login: 'test@expensify.com',
            reportID: null,
            hasDraftComment: false,
            isPinned: false,
            isChatRoom: false,
            participantsList: [],
            descriptiveText: '',
            tooltipText: 'Tooltip text',
        },
    },
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <OptionRow {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});

export {
    Default,
};
