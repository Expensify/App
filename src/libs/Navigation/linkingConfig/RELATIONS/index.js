'use strict';
exports.__esModule = true;
exports.FULLSCREEN_TO_TAB =
    exports.SPLIT_TO_SIDEBAR =
    exports.SIDEBAR_TO_SPLIT =
    exports.WORKSPACE_TO_RHP =
    exports.SIDEBAR_TO_RHP =
    exports.SEARCH_TO_RHP =
    exports.RHP_TO_SIDEBAR =
    exports.RHP_TO_WORKSPACE =
    exports.RHP_TO_SETTINGS =
    exports.SETTINGS_TO_RHP =
        void 0;
var FULLSCREEN_TO_TAB_1 = require('./FULLSCREEN_TO_TAB');
exports.FULLSCREEN_TO_TAB = FULLSCREEN_TO_TAB_1['default'];
var SEARCH_TO_RHP_1 = require('./SEARCH_TO_RHP');
exports.SEARCH_TO_RHP = SEARCH_TO_RHP_1['default'];
var SETTINGS_TO_RHP_1 = require('./SETTINGS_TO_RHP');
exports.SETTINGS_TO_RHP = SETTINGS_TO_RHP_1['default'];
var SIDEBAR_TO_RHP_1 = require('./SIDEBAR_TO_RHP');
exports.SIDEBAR_TO_RHP = SIDEBAR_TO_RHP_1['default'];
var SIDEBAR_TO_SPLIT_1 = require('./SIDEBAR_TO_SPLIT');
exports.SIDEBAR_TO_SPLIT = SIDEBAR_TO_SPLIT_1['default'];
var WORKSPACE_TO_RHP_1 = require('./WORKSPACE_TO_RHP');
exports.WORKSPACE_TO_RHP = WORKSPACE_TO_RHP_1['default'];
function createInverseRelation(relations) {
    var reversedRelations = {};
    Object.entries(relations).forEach(function (_a) {
        var key = _a[0],
            values = _a[1];
        var valuesWithType = Array.isArray(values) ? values : [values];
        valuesWithType.forEach(function (value) {
            reversedRelations[value] = key;
        });
    });
    return reversedRelations;
}
var RHP_TO_SETTINGS = createInverseRelation(SETTINGS_TO_RHP_1['default']);
exports.RHP_TO_SETTINGS = RHP_TO_SETTINGS;
var RHP_TO_WORKSPACE = createInverseRelation(WORKSPACE_TO_RHP_1['default']);
exports.RHP_TO_WORKSPACE = RHP_TO_WORKSPACE;
var RHP_TO_SIDEBAR = createInverseRelation(SIDEBAR_TO_RHP_1['default']);
exports.RHP_TO_SIDEBAR = RHP_TO_SIDEBAR;
var SPLIT_TO_SIDEBAR = createInverseRelation(SIDEBAR_TO_SPLIT_1['default']);
exports.SPLIT_TO_SIDEBAR = SPLIT_TO_SIDEBAR;
