import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import Tooltip from '@components/Tooltip';
import type {TooltipExtendedProps} from '@components/Tooltip/types';

type TooltipStory = StoryFn<typeof Tooltip>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Tooltip> = {
    title: 'Components/Tooltip',
    component: Tooltip,
};

function Template(props: TooltipExtendedProps) {
    return (
        <div style={{width: 100}}>
            <Tooltip
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                // Disable nullish coalescing to handle cases when maxWidth is 0
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                maxWidth={props.maxWidth || undefined}
            >
                <div
                    style={{
                        width: 100,
                        height: 60,
                        display: 'flex',
                        backgroundColor: 'red',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    Hover me
                </div>
            </Tooltip>
        </div>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: TooltipStory = Template.bind({});
Default.args = {
    text: 'Tooltip',
    numberOfLines: 1,
    maxWidth: 0,
};

function RenderContent() {
    const [size, setSize] = React.useState(40);

    const renderTooltipContent = () => (
        <div
            style={{
                width: size,
                height: size,
                backgroundColor: 'blue',
            }}
        />
    );

    return (
        <div style={{width: 100}}>
            <Tooltip renderTooltipContent={renderTooltipContent}>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <div
                    onClick={() => setSize(size + 25)}
                    style={{
                        width: 100,
                        height: 60,
                        display: 'flex',
                        backgroundColor: 'red',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    Hover me {'\n'}
                    Press me change content
                </div>
            </Tooltip>
        </div>
    );
}

export default story;
export {Default, RenderContent};
