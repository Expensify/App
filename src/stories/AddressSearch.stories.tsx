import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import type {AddressSearchProps} from '@components/AddressSearch';
import AddressSearch from '@components/AddressSearch';
import type {StreetValue} from '@components/AddressSearch/types';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

type AddressSearchStory = StoryFn<typeof AddressSearch>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AddressSearch> = {
    title: 'Components/AddressSearch',
    component: AddressSearch,
    args: {
        label: 'Enter street',
        errorText: '',
    },
};

function Template(props: AddressSearchProps) {
    const [value, setValue] = useState<string | number | Address | StreetValue>('');
    return (
        <AddressSearch
            value={value as string}
            onInputChange={(inputValue) => setValue(inputValue)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: AddressSearchStory = Template.bind({});

const ErrorStory: AddressSearchStory = Template.bind({});
ErrorStory.args = {
    errorText: 'The street you are looking for does not exist',
};

export default story;
export {Default, ErrorStory};
