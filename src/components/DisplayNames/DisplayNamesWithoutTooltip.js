"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function DisplayNamesWithoutTooltip(_a) {
    var _b = _a.textStyles, textStyles = _b === void 0 ? [] : _b, _c = _a.numberOfLines, numberOfLines = _c === void 0 ? 1 : _c, _d = _a.fullTitle, fullTitle = _d === void 0 ? '' : _d, renderAdditionalText = _a.renderAdditionalText;
    var styles = (0, useThemeStyles_1.default)();
    return (<Text_1.default style={[textStyles, numberOfLines === 1 ? styles.pre : styles.preWrap]} numberOfLines={numberOfLines}>
            {fullTitle}
            {renderAdditionalText === null || renderAdditionalText === void 0 ? void 0 : renderAdditionalText()}
        </Text_1.default>);
}
DisplayNamesWithoutTooltip.displayName = 'DisplayNamesWithoutTooltip';
exports.default = DisplayNamesWithoutTooltip;
