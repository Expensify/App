import React from 'react';
import {getExpensifyIcon} from '@components/Icon/chunks/expensify-icons.chunk';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import OptionRow from '@components/OptionRow';
import type {OptionRowProps} from '@components/OptionRow';

/* eslint-disable react/jsx-props-no-spreading */

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
        boldStyle: false,
        showTitleTooltip: false,
        isDisabled: false,
        backgroundColor: 'white',
        option: {
            text: 'Test Option',
            alternateText: 'Alternate text',
            cons: [{source: getExpensifyIcon('ActiveRoomAvatar'), name: 'Test Option', type: 'avatar'}],
            login: 'test@expensify.com',
            reportID: null,
            isChatRoom: false,
            participantsList: [],
            descriptiveText: '',
            tooltipText: 'Tooltip text',
        },
    },
};

function Template(props: OptionRowProps) {
    return (
        <OnyxListItemProvider>
            <OptionRow {...props} />
        </OnyxListItemProvider>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});

export {Default};
