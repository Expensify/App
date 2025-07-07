"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ShareLogList_1 = require("./ShareLogList");
function ShareLogPage(_a) {
    var route = _a.route;
    return <ShareLogList_1.default logSource={route.params.source}/>;
}
exports.default = ShareLogPage;
