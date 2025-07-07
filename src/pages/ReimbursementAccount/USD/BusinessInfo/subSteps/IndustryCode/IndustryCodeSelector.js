"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NAICS_1 = require("@src/NAICS");
function IndustryCodeSelector(_a) {
    var onInputChange = _a.onInputChange, value = _a.value, errorText = _a.errorText;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(value), searchValue = _b[0], setSearchValue = _b[1];
    var _c = (0, react_1.useState)(false), shouldDisplayChildItems = _c[0], setShouldDisplayChildItems = _c[1];
    var translate = (0, useLocalize_1.default)().translate;
    var sections = (0, react_1.useMemo)(function () {
        var _a;
        if (!searchValue) {
            return [
                {
                    data: NAICS_1.NAICS.map(function (item) {
                        return {
                            value: "".concat(item.id),
                            text: "".concat(item.id, " - ").concat(item.value),
                            keyForList: "".concat(item.id),
                        };
                    }),
                },
            ];
        }
        if (shouldDisplayChildItems) {
            return [
                {
                    data: ((_a = NAICS_1.NAICS_MAPPING_WITH_ID[searchValue]) !== null && _a !== void 0 ? _a : []).map(function (item) {
                        return {
                            value: "".concat(item.id),
                            text: "".concat(item.id, " - ").concat(item.value),
                            keyForList: "".concat(item.id),
                        };
                    }),
                },
            ];
        }
        return [
            {
                data: NAICS_1.ALL_NAICS.filter(function (item) { return item.id.toString().toLowerCase().startsWith(searchValue.toLowerCase()); }).map(function (item) {
                    return {
                        value: "".concat(item.id),
                        text: "".concat(item.id, " - ").concat(item.value),
                        keyForList: "".concat(item.id),
                    };
                }),
            },
        ];
    }, [searchValue, shouldDisplayChildItems]);
    (0, react_1.useEffect)(function () {
        setSearchValue(value);
    }, [value]);
    return (<react_native_1.View style={styles.flexGrow1}>
            <SelectionList_1.default sections={sections} ListItem={RadioListItem_1.default} onSelectRow={function (item) {
            setSearchValue(item.value);
            setShouldDisplayChildItems(true);
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(item.value);
        }} shouldStopPropagation textInputLabel={translate('companyStep.industryClassificationCodePlaceholder')} onChangeText={function (val) {
            setSearchValue(val);
            setShouldDisplayChildItems(false);
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(val);
        }} textInputValue={searchValue} errorText={errorText}/>
        </react_native_1.View>);
}
IndustryCodeSelector.displayName = 'IndustryCodeSelector';
exports.default = (0, react_1.forwardRef)(IndustryCodeSelector);
