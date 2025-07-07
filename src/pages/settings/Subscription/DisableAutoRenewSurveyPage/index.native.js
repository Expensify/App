"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
function DisableAutoRenewSurveyPage() {
    return (<ScreenWrapper_1.default testID={DisableAutoRenewSurveyPage.displayName} includeSafeAreaPaddingBottom shouldEnableMaxHeight>
            <FullPageNotFoundView_1.default shouldShow/>
        </ScreenWrapper_1.default>);
}
DisableAutoRenewSurveyPage.displayName = 'DisableAutoRenewSurveyPage';
exports.default = DisableAutoRenewSurveyPage;
