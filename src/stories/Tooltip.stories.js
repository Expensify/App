"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
exports.RenderContent = RenderContent;
var react_1 = require("react");
var Tooltip_1 = require("@components/Tooltip");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/Tooltip',
    component: Tooltip_1.default,
};
function Template(props) {
    return (<div style={{ width: 100 }}>
            <Tooltip_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} 
    // Disable nullish coalescing to handle cases when maxWidth is 0
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    maxWidth={props.maxWidth || undefined}>
                <div style={{
            width: 100,
            height: 60,
            display: 'flex',
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
                    Hover me
                </div>
            </Tooltip_1.default>
        </div>);
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
Default.args = {
    text: 'Tooltip',
    numberOfLines: 1,
    maxWidth: 0,
};
function RenderContent() {
    var _a = react_1.default.useState(40), size = _a[0], setSize = _a[1];
    var renderTooltipContent = function () { return (<div style={{
            width: size,
            height: size,
            backgroundColor: 'blue',
        }}/>); };
    return (<div style={{ width: 100 }}>
            <Tooltip_1.default renderTooltipContent={renderTooltipContent}>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <div onClick={function () { return setSize(size + 25); }} style={{
            width: 100,
            height: 60,
            display: 'flex',
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
                    Hover me {'\n'}
                    Press me change content
                </div>
            </Tooltip_1.default>
        </div>);
}
exports.default = story;
