"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentContext = void 0;
exports.EnvironmentProvider = EnvironmentProvider;
var react_1 = require("react");
var Environment_1 = require("@libs/Environment/Environment");
var CONST_1 = require("@src/CONST");
var EnvironmentContext = (0, react_1.createContext)({
    environment: CONST_1.default.ENVIRONMENT.PRODUCTION,
    environmentURL: CONST_1.default.NEW_EXPENSIFY_URL,
});
exports.EnvironmentContext = EnvironmentContext;
function EnvironmentProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(CONST_1.default.ENVIRONMENT.PRODUCTION), environment = _b[0], setEnvironment = _b[1];
    var _c = (0, react_1.useState)(CONST_1.default.NEW_EXPENSIFY_URL), environmentURL = _c[0], setEnvironmentURL = _c[1];
    (0, react_1.useEffect)(function () {
        (0, Environment_1.getEnvironment)().then(setEnvironment);
        (0, Environment_1.getEnvironmentURL)().then(setEnvironmentURL);
    }, []);
    var contextValue = (0, react_1.useMemo)(function () { return ({
        environment: environment,
        environmentURL: environmentURL,
    }); }, [environment, environmentURL]);
    return <EnvironmentContext.Provider value={contextValue}>{children}</EnvironmentContext.Provider>;
}
EnvironmentProvider.displayName = 'EnvironmentProvider';
