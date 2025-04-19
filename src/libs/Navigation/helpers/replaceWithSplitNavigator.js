
exports.__esModule = true;
const navigationRef_1 = require('@libs/Navigation/navigationRef');
const CONST_1 = require('@src/CONST');

function replaceWithSplitNavigator(splitNavigatorState) {
    let _a;
    (_a = navigationRef_1['default'].current) === null || _a === void 0
        ? void 0
        : _a.dispatch({
              target: navigationRef_1['default'].current.getRootState().key,
              payload: splitNavigatorState,
              type: CONST_1['default'].NAVIGATION.ACTION_TYPE.REPLACE,
          });
}
exports['default'] = replaceWithSplitNavigator;
