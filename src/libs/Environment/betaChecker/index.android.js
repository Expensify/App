"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var semver_1 = require("semver");
var AppUpdate = require("@libs/actions/AppUpdate");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var package_json_1 = require("../../../../package.json");
var isLastSavedBeta = false;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.IS_BETA,
    callback: function (value) {
        isLastSavedBeta = !!value;
    },
});
/**
 * Check the GitHub releases to see if the current build is a beta build or production build
 */
function isBetaBuild() {
    return new Promise(function (resolve) {
        fetch(CONST_1.default.GITHUB_RELEASE_URL)
            .then(function (res) { return res.json(); })
            .then(function (json) {
            var productionVersion = json.tag_name;
            if (!productionVersion) {
                AppUpdate.setIsAppInBeta(false);
                resolve(false);
            }
            // If the current version we are running is greater than the production version, we are on a beta version of Android
            var isBeta = semver_1.default.gt(package_json_1.default.version, productionVersion);
            AppUpdate.setIsAppInBeta(isBeta);
            resolve(isBeta);
        })
            .catch(function () {
            // Use isLastSavedBeta in case we fail to fetch the new one, e.g. when we are offline
            resolve(isLastSavedBeta);
        });
    });
}
exports.default = {
    isBetaBuild: isBetaBuild,
};
