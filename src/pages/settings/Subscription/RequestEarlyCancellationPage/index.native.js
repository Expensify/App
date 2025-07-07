"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
function RequestEarlyCancellationPage() {
    return (<ScreenWrapper_1.default testID={RequestEarlyCancellationPage.displayName} includeSafeAreaPaddingBottom shouldEnableMaxHeight>
            <FullPageNotFoundView_1.default shouldShow/>
        </ScreenWrapper_1.default>);
}
RequestEarlyCancellationPage.displayName = 'RequestEarlyCancellationPage';
exports.default = RequestEarlyCancellationPage;
