"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = Default;
var react_1 = require("react");
var react_native_1 = require("react-native");
var Consumer_1 = require("@components/DragAndDrop/Consumer");
var Provider_1 = require("@components/DragAndDrop/Provider");
var Text_1 = require("@components/Text");
var styles_1 = require("@src/styles");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/DragAndDrop',
    component: Consumer_1.default,
};
function Default() {
    var _a = (0, react_1.useState)(''), fileURL = _a[0], setFileURL = _a[1];
    return (<react_native_1.View style={[
            {
                width: 500,
                height: 500,
                backgroundColor: 'beige',
            },
            styles_1.defaultStyles.alignItemsCenter,
            styles_1.defaultStyles.justifyContentCenter,
        ]}>
            <Provider_1.default>
                <react_native_1.View style={[styles_1.defaultStyles.w100, styles_1.defaultStyles.h100, styles_1.defaultStyles.justifyContentCenter, styles_1.defaultStyles.alignItemsCenter]}>
                    {fileURL ? (<react_native_1.Image source={{ uri: fileURL }} style={{
                width: 200,
                height: 200,
            }}/>) : (<Text_1.default color="black">Drop a picture here!</Text_1.default>)}
                </react_native_1.View>
                <Consumer_1.default onDrop={function (event) {
            var _a, _b;
            var file = (_b = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0];
            if (file === null || file === void 0 ? void 0 : file.type.includes('image')) {
                var reader_1 = new FileReader();
                reader_1.addEventListener('load', function () { return setFileURL(reader_1.result); });
                reader_1.readAsDataURL(file);
            }
        }}>
                    <react_native_1.View style={[styles_1.defaultStyles.w100, styles_1.defaultStyles.h100, styles_1.defaultStyles.alignItemsCenter, styles_1.defaultStyles.justifyContentCenter, { backgroundColor: 'white' }]}>
                        <Text_1.default color="black">Release to upload file</Text_1.default>
                    </react_native_1.View>
                </Consumer_1.default>
            </Provider_1.default>
        </react_native_1.View>);
}
exports.default = story;
