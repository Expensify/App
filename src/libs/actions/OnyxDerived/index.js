"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This file contains logic for derived Onyx keys. The idea behind derived keys is that if there is a common computation
 * that we're doing in many places across the app to derive some value from multiple Onyx values, we can move that
 * computation into this file, run it only once, and then share it across the app by storing the result of that computation in Onyx.
 *
 * The primary purpose is to optimize performance by reducing redundant computations. More info can be found in the README.
 */
var react_native_onyx_1 = require("react-native-onyx");
var OnyxUtils_1 = require("react-native-onyx/dist/OnyxUtils");
var Log_1 = require("@libs/Log");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ObjectUtils_1 = require("@src/types/utils/ObjectUtils");
var ONYX_DERIVED_VALUES_1 = require("./ONYX_DERIVED_VALUES");
/**
 * Initialize all Onyx derived values, store them in Onyx, and setup listeners to update them when dependencies change.
 */
function init() {
    var _loop_1 = function (key, compute, dependencies) {
        var areAllConnectionsSet = false;
        var connectionsEstablishedCount = 0;
        var totalConnections = dependencies.length;
        var connectionInitializedFlags = new Array(totalConnections).fill(false);
        // Create an array to hold the current values for each dependency.
        // We cast its type to match the tuple expected by config.compute.
        var dependencyValues = new Array(totalConnections);
        OnyxUtils_1.default.get(key).then(function (storedDerivedValue) {
            var derivedValue = storedDerivedValue;
            if (derivedValue) {
                Log_1.default.info("Derived value for ".concat(key, " restored from disk"));
            }
            else {
                OnyxUtils_1.default.tupleGet(dependencies).then(function (values) {
                    var initialContext = {
                        currentValue: derivedValue,
                        sourceValues: undefined,
                        areAllConnectionsSet: false,
                    };
                    derivedValue = compute(dependencyValues, initialContext);
                    dependencyValues = values;
                    react_native_onyx_1.default.set(key, derivedValue !== null && derivedValue !== void 0 ? derivedValue : null);
                });
            }
            var setDependencyValue = function (i, value) {
                dependencyValues[i] = value;
            };
            var checkAndMarkConnectionInitialized = function (index) {
                if (connectionInitializedFlags.at(index)) {
                    return;
                }
                connectionInitializedFlags[index] = true;
                connectionsEstablishedCount++;
                if (connectionsEstablishedCount === totalConnections) {
                    areAllConnectionsSet = true;
                    Log_1.default.info("[OnyxDerived] All connections initialized for key: ".concat(key));
                }
            };
            var recomputeDerivedValue = function (sourceKey, sourceValue, triggeredByIndex) {
                var _a;
                // If this recompute was triggered by a connection callback, check if it initializes the connection
                if (triggeredByIndex !== undefined) {
                    checkAndMarkConnectionInitialized(triggeredByIndex);
                }
                var context = {
                    currentValue: derivedValue,
                    sourceValues: undefined,
                    areAllConnectionsSet: areAllConnectionsSet,
                };
                // If we got a source key and value, add it to the sourceValues object
                if (sourceKey && sourceValue !== undefined) {
                    context.sourceValues = (_a = {},
                        _a[sourceKey] = sourceValue,
                        _a);
                }
                var newDerivedValue = compute(dependencyValues, context);
                Log_1.default.info("[OnyxDerived] updating value for ".concat(key, " in Onyx"));
                derivedValue = newDerivedValue;
                react_native_onyx_1.default.set(key, derivedValue !== null && derivedValue !== void 0 ? derivedValue : null);
            };
            var _loop_2 = function (i) {
                var dependencyIndex = i;
                var dependencyOnyxKey = dependencies[dependencyIndex];
                if (OnyxUtils_1.default.isCollectionKey(dependencyOnyxKey)) {
                    react_native_onyx_1.default.connect({
                        key: dependencyOnyxKey,
                        waitForCollectionCallback: true,
                        callback: function (value, collectionKey, sourceValue) {
                            Log_1.default.info("[OnyxDerived] dependency ".concat(collectionKey, " for derived key ").concat(key, " changed, recomputing"));
                            setDependencyValue(dependencyIndex, value);
                            recomputeDerivedValue(dependencyOnyxKey, sourceValue, dependencyIndex);
                        },
                    });
                }
                else if (dependencyOnyxKey === ONYXKEYS_1.default.NVP_PREFERRED_LOCALE) {
                    // Special case for locale, we want to recompute derived values when the locale change actually loads.
                    react_native_onyx_1.default.connect({
                        key: ONYXKEYS_1.default.ARE_TRANSLATIONS_LOADING,
                        initWithStoredValues: false,
                        callback: function (value) {
                            if (value !== null && value !== void 0 ? value : true) {
                                Log_1.default.info("[OnyxDerived] translations are still loading, not recomputing derived value for ".concat(key));
                                return;
                            }
                            Log_1.default.info("[OnyxDerived] translations loaded, recomputing derived value for ".concat(key));
                            var localeValue = IntlStore_1.default.getCurrentLocale();
                            if (!localeValue) {
                                Log_1.default.info("[OnyxDerived] No locale found for derived key ".concat(key, ", skipping recompute"));
                                return;
                            }
                            Log_1.default.info("[OnyxDerived] dependency ".concat(dependencyOnyxKey, " for derived key ").concat(key, " changed, recomputing"));
                            setDependencyValue(dependencyIndex, localeValue);
                            recomputeDerivedValue(dependencyOnyxKey, localeValue, dependencyIndex);
                        },
                    });
                }
                else {
                    react_native_onyx_1.default.connect({
                        key: dependencyOnyxKey,
                        callback: function (value) {
                            Log_1.default.info("[OnyxDerived] dependency ".concat(dependencyOnyxKey, " for derived key ").concat(key, " changed, recomputing"));
                            setDependencyValue(dependencyIndex, value);
                            // if the dependency is not a collection, pass the entire value as the source value
                            recomputeDerivedValue(dependencyOnyxKey, value, dependencyIndex);
                        },
                    });
                }
            };
            for (var i = 0; i < dependencies.length; i++) {
                _loop_2(i);
            }
        });
    };
    for (var _i = 0, _a = ObjectUtils_1.default.typedEntries(ONYX_DERIVED_VALUES_1.default); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], _c = _b[1], compute = _c.compute, dependencies = _c.dependencies;
        _loop_1(key, compute, dependencies);
    }
}
exports.default = init;
