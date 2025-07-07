"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var ManageTrips_1 = require("./ManageTrips");
function MyTripsPage() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight testID={MyTripsPage.displayName} shouldShowOfflineIndicatorInWideScreen>
            <HeaderWithBackButton_1.default title={translate('travel.header')} shouldShowBackButton/>
            <ManageTrips_1.default />
        </ScreenWrapper_1.default>);
}
MyTripsPage.displayName = 'MyTripsPage';
exports.default = MyTripsPage;
