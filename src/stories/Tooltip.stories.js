import React from 'react';
import Tooltip from '../components/Tooltip';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Tooltip',
    component: Tooltip,
};

const Template = (args) => (
    <div
        style={{
            width: 100,
        }}
    >
        <Tooltip
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            maxWidth={args.maxWidth || undefined}
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

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    text: 'Tooltip',
    numberOfLines: 1,
    maxWidth: 0,
    absolute: false,
};

const RenderContent = () => {
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
        <div
            style={{
                width: 100,
            }}
        >
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
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
};

export default story;
export {Default, RenderContent};
