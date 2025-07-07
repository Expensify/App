"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var FixedFooter_1 = require("@components/FixedFooter");
var Icon_1 = require("@components/Icon");
var Illustrations = require("@components/Icon/Illustrations");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var Link = require("@userActions/Link");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctUserDimensionsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var config = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.intacct) === null || _d === void 0 ? void 0 : _d.config;
    var userDimensions = (_j = (_h = (_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.intacct) === null || _f === void 0 ? void 0 : _f.config) === null || _g === void 0 ? void 0 : _g.mappings) === null || _h === void 0 ? void 0 : _h.dimensions) !== null && _j !== void 0 ? _j : [];
    return (<ConnectionLayout_1.default displayName={SageIntacctUserDimensionsPage.displayName} headerTitle="workspace.intacct.userDefinedDimension" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.flex1]} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} shouldUseScrollView={false} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.getRoute(policyID)); }}>
            {(userDimensions === null || userDimensions === void 0 ? void 0 : userDimensions.length) === 0 ? (<react_native_1.View style={[styles.alignItemsCenter, styles.flex1, styles.justifyContentCenter]}>
                    <Icon_1.default src={Illustrations.FolderWithPapers} width={160} height={100}/>

                    <react_native_1.View style={[styles.w100, styles.pt5]}>
                        <react_native_1.View style={[styles.justifyContentCenter, styles.ph5]}>
                            <Text_1.default style={[styles.notFoundTextHeader]}>{translate('workspace.intacct.addAUserDefinedDimension')}</Text_1.default>
                        </react_native_1.View>

                        <react_native_1.View style={[styles.ph5]}>
                            <Text_1.default style={[styles.textAlignCenter]}>
                                <TextLink_1.default style={styles.link} onPress={function () {
                Link.openExternalLink(CONST_1.default.SAGE_INTACCT_INSTRUCTIONS);
            }}>
                                    {translate('workspace.intacct.detailedInstructionsLink')}
                                </TextLink_1.default>
                                <Text_1.default>{translate('workspace.intacct.detailedInstructionsRestOfSentence')}</Text_1.default>
                            </Text_1.default>
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.View>) : (<>
                    <react_native_1.View style={[styles.ph5]}>
                        <Text_1.default style={[styles.textAlignLeft]}>
                            <TextLink_1.default style={styles.link} onPress={function () {
                Link.openExternalLink(CONST_1.default.SAGE_INTACCT_INSTRUCTIONS);
            }}>
                                {translate('workspace.intacct.detailedInstructionsLink')}
                            </TextLink_1.default>
                            <Text_1.default>{translate('workspace.intacct.detailedInstructionsRestOfSentence')}</Text_1.default>
                        </Text_1.default>
                    </react_native_1.View>
                    <ScrollView_1.default addBottomSafeAreaPadding>
                        {userDimensions.map(function (userDimension) { return (<OfflineWithFeedback_1.default key={userDimension.dimension} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(userDimension.dimension)], config === null || config === void 0 ? void 0 : config.pendingFields)}>
                                <MenuItemWithTopDescription_1.default title={userDimension.dimension} description={translate('workspace.intacct.userDefinedDimension')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_EDIT_USER_DIMENSION.getRoute(policyID, userDimension.dimension)); }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(userDimension.dimension)], config === null || config === void 0 ? void 0 : config.errorFields)
                    ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
                    : undefined}/>
                            </OfflineWithFeedback_1.default>); })}
                    </ScrollView_1.default>
                </>)}
            <FixedFooter_1.default style={[styles.mt5]} addBottomSafeAreaPadding>
                <Button_1.default success text={translate('workspace.intacct.addUserDefinedDimension')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_ADD_USER_DIMENSION.getRoute(policyID)); }} pressOnEnter large/>
            </FixedFooter_1.default>
        </ConnectionLayout_1.default>);
}
SageIntacctUserDimensionsPage.displayName = 'SageIntacctUserDimensionsPage';
exports.default = (0, withPolicy_1.default)(SageIntacctUserDimensionsPage);
