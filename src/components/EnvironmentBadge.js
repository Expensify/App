"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Environment = require("@libs/Environment/Environment");
var CONST_1 = require("@src/CONST");
var package_json_1 = require("../../package.json");
var Badge_1 = require("./Badge");
var ENVIRONMENT_SHORT_FORM = (_a = {},
    _a[CONST_1.default.ENVIRONMENT.DEV] = 'DEV',
    _a[CONST_1.default.ENVIRONMENT.STAGING] = 'STG',
    _a[CONST_1.default.ENVIRONMENT.PRODUCTION] = 'PROD',
    _a[CONST_1.default.ENVIRONMENT.ADHOC] = 'ADHOC',
    _a);
function EnvironmentBadge() {
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _a = (0, useEnvironment_1.default)(), environment = _a.environment, isProduction = _a.isProduction;
    var adhoc = environment === CONST_1.default.ENVIRONMENT.ADHOC;
    var success = environment === CONST_1.default.ENVIRONMENT.STAGING;
    var error = environment !== CONST_1.default.ENVIRONMENT.STAGING && environment !== CONST_1.default.ENVIRONMENT.ADHOC;
    var badgeEnvironmentStyle = StyleUtils.getEnvironmentBadgeStyle(success, error, adhoc);
    // If we are on production, don't show any badge
    if (isProduction) {
        return null;
    }
    var text = Environment.isInternalTestBuild() ? "v".concat(package_json_1.default.version, " PR:").concat(CONST_1.default.PULL_REQUEST_NUMBER) : ENVIRONMENT_SHORT_FORM[environment];
    return (<Badge_1.default success={success} error={error} text={text} badgeStyles={[styles.alignSelfStart, styles.headerEnvBadge, styles.environmentBadge, badgeEnvironmentStyle]} textStyles={styles.headerEnvBadgeText} environment={environment} pressable/>);
}
EnvironmentBadge.displayName = 'EnvironmentBadge';
exports.default = EnvironmentBadge;
