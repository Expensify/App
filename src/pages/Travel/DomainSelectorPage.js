"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var TravelDomainListItem_1 = require("@components/SelectionList/TravelDomainListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Travel_1 = require("@libs/actions/Travel");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function DomainSelectorPage(_a) {
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(activePolicyID);
    var _b = (0, react_1.useState)(), selectedDomain = _b[0], setSelectedDomain = _b[1];
    var domains = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getAdminsPrivateEmailDomains)(policy); }, [policy]);
    var recommendedDomain = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getMostFrequentEmailDomain)(domains, policy); }, [policy, domains]);
    var data = (0, react_1.useMemo)(function () {
        return domains.map(function (domain) {
            return {
                value: domain,
                isSelected: domain === selectedDomain,
                keyForList: domain,
                text: domain,
                isRecommended: domain === recommendedDomain,
            };
        });
    }, [domains, recommendedDomain, selectedDomain]);
    var provisionTravelForDomain = function () {
        var domain = selectedDomain !== null && selectedDomain !== void 0 ? selectedDomain : CONST_1.default.TRAVEL.DEFAULT_DOMAIN;
        if ((0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.address)) {
            // Spotnana requires an address anytime an entity is created for a policy
            Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_WORKSPACE_ADDRESS.getRoute(domain, Navigation_1.default.getActiveRoute()));
        }
        else {
            (0, Travel_1.cleanupTravelProvisioningSession)();
            Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_TCS.getRoute(domain));
        }
    };
    return (<ScreenWrapper_1.default shouldEnableMaxHeight testID={DomainSelectorPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('travel.domainSelector.title')} onBackButtonPress={function () { return Navigation_1.default.goBack(route.params.backTo); }}/>
            <Text_1.default style={[styles.mt3, styles.mr5, styles.mb5, styles.ml5]}>{translate('travel.domainSelector.subtitle')}</Text_1.default>
            <SelectionList_1.default onSelectRow={function (option) { return setSelectedDomain(option.value); }} sections={[{ title: translate('travel.domainSelector.title'), data: data }]} canSelectMultiple ListItem={TravelDomainListItem_1.default} shouldShowTooltips footerContent={<Button_1.default isDisabled={!selectedDomain} success large style={[styles.w100]} onPress={provisionTravelForDomain} text={translate('common.continue')}/>}/>
        </ScreenWrapper_1.default>);
}
DomainSelectorPage.displayName = 'DomainSelectorPage';
exports.default = DomainSelectorPage;
