"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
function SubscriptionSizePage() {
    return (<ScreenWrapper_1.default testID={SubscriptionSizePage.displayName} includeSafeAreaPaddingBottom shouldEnableMaxHeight>
            <FullPageNotFoundView_1.default shouldShow/>
        </ScreenWrapper_1.default>);
}
SubscriptionSizePage.displayName = 'SubscriptionSizePage';
exports.default = SubscriptionSizePage;
