"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = Default;
exports.WithTextInput = WithTextInput;
exports.WithHeaderMessage = WithHeaderMessage;
exports.WithAlternateText = WithAlternateText;
exports.MultipleSelection = MultipleSelection;
exports.WithSectionHeader = WithSectionHeader;
exports.WithConfirmButton = WithConfirmButton;
var react_1 = require("react");
var Badge_1 = require("@components/Badge");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var withNavigationFallback_1 = require("@components/withNavigationFallback");
// eslint-disable-next-line no-restricted-imports
var index_1 = require("@styles/index");
var CONST_1 = require("@src/CONST");
var SelectionListWithNavigation = (0, withNavigationFallback_1.default)(SelectionList_1.default);
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/SelectionList',
    component: SelectionList_1.default,
    parameters: {
        docs: {
            source: {
                type: 'code',
            },
        },
    },
};
var SECTIONS = [
    {
        data: [
            {
                text: 'Option 1',
                keyForList: 'option-1',
                isSelected: false,
            },
            {
                text: 'Option 2',
                keyForList: 'option-2',
                isSelected: false,
            },
            {
                text: 'Option 3',
                keyForList: 'option-3',
                isSelected: false,
            },
        ],
        isDisabled: false,
    },
    {
        data: [
            {
                text: 'Option 4',
                keyForList: 'option-4',
                isSelected: false,
            },
            {
                text: 'Option 5',
                keyForList: 'option-5',
                isSelected: false,
            },
            {
                text: 'Option 6',
                keyForList: 'option-6',
                isSelected: false,
            },
        ],
        isDisabled: false,
    },
];
function Default(props) {
    var _a = (0, react_1.useState)(1), selectedIndex = _a[0], setSelectedIndex = _a[1];
    var sections = props.sections.map(function (section) {
        var data = section.data.map(function (item, index) {
            var isSelected = selectedIndex === index;
            return __assign(__assign({}, item), { isSelected: isSelected });
        });
        return __assign(__assign({}, section), { data: data });
    });
    var onSelectRow = function (item) {
        sections.forEach(function (section) {
            var newSelectedIndex = section.data.findIndex(function (option) { return option.keyForList === item.keyForList; });
            if (newSelectedIndex >= 0) {
                setSelectedIndex(newSelectedIndex);
            }
        });
    };
    return (<SelectionListWithNavigation 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} sections={sections} ListItem={RadioListItem_1.default} onSelectRow={onSelectRow}/>);
}
Default.args = {
    sections: SECTIONS,
    onSelectRow: function () { },
    initiallyFocusedOptionKey: 'option-2',
};
function WithTextInput(props) {
    var _a = (0, react_1.useState)(''), searchText = _a[0], setSearchText = _a[1];
    var _b = (0, react_1.useState)(1), selectedIndex = _b[0], setSelectedIndex = _b[1];
    var sections = props.sections.map(function (section) {
        var data = section.data.reduce(function (memo, item, index) {
            var _a;
            if (!((_a = item.text) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchText.trim().toLowerCase()))) {
                return memo;
            }
            var isSelected = selectedIndex === index;
            memo.push(__assign(__assign({}, item), { isSelected: isSelected }));
            return memo;
        }, []);
        return __assign(__assign({}, section), { data: data });
    });
    var onSelectRow = function (item) {
        sections.forEach(function (section) {
            var newSelectedIndex = section.data.findIndex(function (option) { return option.keyForList === item.keyForList; });
            if (newSelectedIndex >= 0) {
                setSelectedIndex(newSelectedIndex);
            }
        });
    };
    return (<SelectionListWithNavigation 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} sections={sections} ListItem={RadioListItem_1.default} textInputValue={searchText} onChangeText={setSearchText} onSelectRow={onSelectRow}/>);
}
WithTextInput.args = {
    sections: SECTIONS,
    textInputLabel: 'Option list',
    textInputPlaceholder: 'Search something...',
    textInputMaxLength: 4,
    inputMode: CONST_1.default.INPUT_MODE.NUMERIC,
    initiallyFocusedOptionKey: 'option-2',
    onSelectRow: function () { },
    onChangeText: function () { },
};
function WithHeaderMessage(props) {
    return (<WithTextInput 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
WithHeaderMessage.args = __assign(__assign({}, WithTextInput.args), { headerMessage: 'No results found', sections: [] });
function WithAlternateText(props) {
    var _a = (0, react_1.useState)(1), selectedIndex = _a[0], setSelectedIndex = _a[1];
    var sections = props.sections.map(function (section) {
        var data = section.data.map(function (item, index) {
            var isSelected = selectedIndex === index;
            return __assign(__assign({}, item), { alternateText: "Alternate ".concat(index + 1), isSelected: isSelected });
        });
        return __assign(__assign({}, section), { data: data });
    });
    var onSelectRow = function (item) {
        sections.forEach(function (section) {
            var newSelectedIndex = section.data.findIndex(function (option) { return option.keyForList === item.keyForList; });
            if (newSelectedIndex >= 0) {
                setSelectedIndex(newSelectedIndex);
            }
        });
    };
    return (<SelectionListWithNavigation 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} sections={sections} onSelectRow={onSelectRow} ListItem={RadioListItem_1.default}/>);
}
WithAlternateText.args = __assign({}, Default.args);
function MultipleSelection(props) {
    var _a = (0, react_1.useState)(['option-1', 'option-2']), selectedIds = _a[0], setSelectedIds = _a[1];
    var memo = (0, react_1.useMemo)(function () {
        var allIds = [];
        var sections = props.sections.map(function (section) {
            var data = section.data.map(function (item, index) {
                if (item.keyForList) {
                    allIds.push(item.keyForList);
                }
                var isSelected = item.keyForList ? selectedIds.includes(item.keyForList) : false;
                var isAdmin = index === 0;
                return __assign(__assign({}, item), { isSelected: isSelected, alternateText: "".concat(item.keyForList, "@email.com"), accountID: Number(item.keyForList), login: item.text, rightElement: isAdmin && (<Badge_1.default text="Admin" textStyles={index_1.defaultStyles.textStrong} badgeStyles={index_1.defaultStyles.badgeBordered}/>) });
            });
            return __assign(__assign({}, section), { data: data });
        });
        return { sections: sections, allIds: allIds };
    }, [props.sections, selectedIds]);
    var onSelectRow = function (item) {
        if (!item.keyForList) {
            return;
        }
        var newSelectedIds = selectedIds.includes(item.keyForList) ? selectedIds.filter(function (id) { return id !== item.keyForList; }) : __spreadArray(__spreadArray([], selectedIds, true), [item.keyForList], false);
        setSelectedIds(newSelectedIds);
    };
    var onSelectAll = function () {
        if (selectedIds.length === memo.allIds.length) {
            setSelectedIds([]);
        }
        else {
            setSelectedIds(memo.allIds);
        }
    };
    return (<SelectionListWithNavigation 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} sections={memo.sections} ListItem={RadioListItem_1.default} onSelectRow={onSelectRow} onSelectAll={onSelectAll}/>);
}
MultipleSelection.args = __assign(__assign({}, Default.args), { canSelectMultiple: true, onSelectAll: function () { } });
function WithSectionHeader(props) {
    var _a = (0, react_1.useState)(['option-1', 'option-2']), selectedIds = _a[0], setSelectedIds = _a[1];
    var memo = (0, react_1.useMemo)(function () {
        var allIds = [];
        var sections = props.sections.map(function (section, sectionIndex) {
            var data = section.data.map(function (item, itemIndex) {
                if (item.keyForList) {
                    allIds.push(item.keyForList);
                }
                var isSelected = item.keyForList ? selectedIds.includes(item.keyForList) : false;
                var isAdmin = itemIndex === 0;
                return __assign(__assign({}, item), { isSelected: isSelected, alternateText: "".concat(item.keyForList, "@email.com"), accountID: Number(item.keyForList), login: item.text, rightElement: isAdmin && (<Badge_1.default text="Admin" textStyles={index_1.defaultStyles.textStrong} badgeStyles={index_1.defaultStyles.badgeBordered}/>) });
            });
            return __assign(__assign({}, section), { data: data, title: "Section ".concat(sectionIndex + 1) });
        });
        return { sections: sections, allIds: allIds };
    }, [props.sections, selectedIds]);
    var onSelectRow = function (item) {
        if (!item.keyForList) {
            return;
        }
        var newSelectedIds = selectedIds.includes(item.keyForList) ? selectedIds.filter(function (id) { return id !== item.keyForList; }) : __spreadArray(__spreadArray([], selectedIds, true), [item.keyForList], false);
        setSelectedIds(newSelectedIds);
    };
    var onSelectAll = function () {
        if (selectedIds.length === memo.allIds.length) {
            setSelectedIds([]);
        }
        else {
            setSelectedIds(memo.allIds);
        }
    };
    return (<SelectionListWithNavigation 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} sections={memo.sections} ListItem={RadioListItem_1.default} onSelectRow={onSelectRow} onSelectAll={onSelectAll}/>);
}
WithSectionHeader.args = __assign({}, MultipleSelection.args);
function WithConfirmButton(props) {
    var _a = (0, react_1.useState)(['option-1', 'option-2']), selectedIds = _a[0], setSelectedIds = _a[1];
    var memo = (0, react_1.useMemo)(function () {
        var allIds = [];
        var sections = props.sections.map(function (section, sectionIndex) {
            var data = section.data.map(function (item, itemIndex) {
                if (item.keyForList) {
                    allIds.push(item.keyForList);
                }
                var isSelected = item.keyForList ? selectedIds.includes(item.keyForList) : false;
                var isAdmin = itemIndex === 0;
                return __assign(__assign({}, item), { isSelected: isSelected, alternateText: "".concat(item.keyForList, "@email.com"), accountID: Number(item.keyForList), login: item.text, rightElement: isAdmin && (<Badge_1.default text="Admin" textStyles={index_1.defaultStyles.textStrong} badgeStyles={index_1.defaultStyles.badgeBordered}/>) });
            });
            return __assign(__assign({}, section), { data: data, title: "Section ".concat(sectionIndex + 1) });
        });
        return { sections: sections, allIds: allIds };
    }, [props.sections, selectedIds]);
    var onSelectRow = function (item) {
        if (!item.keyForList) {
            return;
        }
        var newSelectedIds = selectedIds.includes(item.keyForList) ? selectedIds.filter(function (id) { return id !== item.keyForList; }) : __spreadArray(__spreadArray([], selectedIds, true), [item.keyForList], false);
        setSelectedIds(newSelectedIds);
    };
    var onSelectAll = function () {
        if (selectedIds.length === memo.allIds.length) {
            setSelectedIds([]);
        }
        else {
            setSelectedIds(memo.allIds);
        }
    };
    return (<SelectionListWithNavigation 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} sections={memo.sections} ListItem={RadioListItem_1.default} onSelectRow={onSelectRow} onSelectAll={onSelectAll}/>);
}
WithConfirmButton.args = __assign(__assign({}, MultipleSelection.args), { onConfirm: function () { }, confirmButtonText: 'Confirm', showConfirmButton: true });
exports.default = story;
