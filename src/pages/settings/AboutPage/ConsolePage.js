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
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var InvertedFlatList_1 = require("@components/InvertedFlatList");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useIsAuthenticated_1 = require("@hooks/useIsAuthenticated");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThreeDotsAnchorPosition_1 = require("@hooks/useThreeDotsAnchorPosition");
var Console_1 = require("@libs/actions/Console");
var Console_2 = require("@libs/Console");
var localFileCreate_1 = require("@libs/localFileCreate");
var localFileDownload_1 = require("@libs/localFileDownload");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var filterBy = {
    all: '',
    network: '[Network]',
};
function ConsolePage() {
    var capturedLogs = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGS)[0];
    var shouldStoreLogs = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHOULD_STORE_LOGS)[0];
    var _a = (0, react_1.useState)(''), input = _a[0], setInput = _a[1];
    var _b = (0, react_1.useState)(false), isGeneratingLogsFile = _b[0], setIsGeneratingLogsFile = _b[1];
    var _c = (0, react_1.useState)(false), isLimitModalVisible = _c[0], setIsLimitModalVisible = _c[1];
    var _d = (0, react_1.useState)(filterBy.all), activeFilterIndex = _d[0], setActiveFilterIndex = _d[1];
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var threeDotsAnchorPosition = (0, useThreeDotsAnchorPosition_1.default)(styles.threeDotsPopoverOffsetNoCloseButton);
    var route = (0, native_1.useRoute)();
    var isAuthenticated = (0, useIsAuthenticated_1.default)();
    var menuItems = (0, react_1.useMemo)(function () { return [
        {
            text: translate('common.filterLogs'),
            disabled: true,
        },
        {
            icon: Expensicons.All,
            text: translate('common.all'),
            iconFill: activeFilterIndex === filterBy.all ? theme.iconSuccessFill : theme.icon,
            iconRight: Expensicons.Checkmark,
            shouldShowRightIcon: activeFilterIndex === filterBy.all,
            success: activeFilterIndex === filterBy.all,
            onSelected: function () {
                setActiveFilterIndex(filterBy.all);
            },
        },
        {
            icon: Expensicons.Globe,
            text: translate('common.network'),
            iconFill: activeFilterIndex === filterBy.network ? theme.iconSuccessFill : theme.icon,
            iconRight: Expensicons.CheckCircle,
            shouldShowRightIcon: activeFilterIndex === filterBy.network,
            success: activeFilterIndex === filterBy.network,
            onSelected: function () {
                setActiveFilterIndex(filterBy.network);
            },
        },
    ]; }, [activeFilterIndex, theme.icon, theme.iconSuccessFill, translate]);
    var prevLogs = (0, react_1.useRef)({});
    var getLogs = (0, react_1.useCallback)(function () {
        var _a;
        if (!shouldStoreLogs) {
            return [];
        }
        prevLogs.current = __assign(__assign({}, prevLogs.current), capturedLogs);
        return Object.entries((_a = prevLogs.current) !== null && _a !== void 0 ? _a : {})
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return (__assign({ key: key }, value));
        })
            .reverse();
    }, [capturedLogs, shouldStoreLogs]);
    // eslint-disable-next-line react-compiler/react-compiler
    var logsList = (0, react_1.useMemo)(function () { return getLogs(); }, [getLogs]);
    var filteredLogsList = (0, react_1.useMemo)(function () { return logsList.filter(function (log) { return log.message.includes(activeFilterIndex); }); }, [activeFilterIndex, logsList]);
    var executeArbitraryCode = function () {
        var sanitizedInput = (0, Console_2.sanitizeConsoleInput)(input);
        var output = (0, Console_2.createLog)(sanitizedInput);
        output.forEach(function (log) { return (0, Console_1.addLog)(log); });
        setInput('');
    };
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ENTER, executeArbitraryCode);
    var saveLogs = function () {
        var logsWithParsedMessages = (0, Console_2.parseStringifiedMessages)(filteredLogsList);
        (0, localFileDownload_1.default)('logs', JSON.stringify(logsWithParsedMessages, null, 2));
    };
    var shareLogs = function () {
        setIsGeneratingLogsFile(true);
        var logsWithParsedMessages = (0, Console_2.parseStringifiedMessages)(filteredLogsList);
        // Generate a file with the logs and pass its path to the list of reports to share it with
        (0, localFileCreate_1.default)('logs', JSON.stringify(logsWithParsedMessages, null, 2)).then(function (_a) {
            var path = _a.path, size = _a.size;
            setIsGeneratingLogsFile(false);
            // if the file size is too large to send it as an attachment, show a modal and return
            if (size > CONST_1.default.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                setIsLimitModalVisible(true);
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SHARE_LOG.getRoute(path));
        });
    };
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var item = _a.item;
        if (!item) {
            return null;
        }
        return (<react_native_1.View style={styles.mb2}>
                    <Text_1.default family="MONOSPACE">{"".concat((0, date_fns_1.format)(new Date(item.time), CONST_1.default.DATE.FNS_DB_FORMAT_STRING), " ").concat(item.message)}</Text_1.default>
                </react_native_1.View>);
    }, [styles.mb2]);
    return (<ScreenWrapper_1.default testID={ConsolePage.displayName} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('initialSettingsPage.troubleshoot.debugConsole')} onBackButtonPress={function () { var _a; return Navigation_1.default.goBack((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo); }} shouldShowThreeDotsButton threeDotsMenuItems={menuItems} threeDotsAnchorPosition={threeDotsAnchorPosition} threeDotsMenuIcon={Expensicons.Filter} threeDotsMenuIconFill={theme.icon}/>
            <react_native_1.View style={[styles.border, styles.highlightBG, styles.borderNone, styles.mh5, styles.flex1]}>
                <InvertedFlatList_1.default data={filteredLogsList} renderItem={renderItem} contentContainerStyle={styles.p5} ListEmptyComponent={<Text_1.default>{translate('initialSettingsPage.debugConsole.noLogsAvailable')}</Text_1.default>}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.dFlex, styles.flexRow, styles.m5]}>
                <Button_1.default text={translate('initialSettingsPage.debugConsole.saveLog')} onPress={saveLogs} large icon={Expensicons.Download} style={[styles.flex1, styles.mr1]}/>
                {isAuthenticated && (<Button_1.default text={translate('initialSettingsPage.debugConsole.shareLog')} onPress={shareLogs} large icon={!isGeneratingLogsFile ? Expensicons.UploadAlt : undefined} style={[styles.flex1, styles.ml1]} isLoading={isGeneratingLogsFile}/>)}
            </react_native_1.View>
            <react_native_1.View style={[styles.mh5]}>
                <TextInput_1.default onChangeText={setInput} value={input} placeholder={translate('initialSettingsPage.debugConsole.enterCommand')} autoGrowHeight autoCorrect={false} accessibilityRole="text"/>
                <Button_1.default success text={translate('initialSettingsPage.debugConsole.execute')} onPress={executeArbitraryCode} style={[styles.mv5]} large/>
            </react_native_1.View>
            <ConfirmModal_1.default title={translate('initialSettingsPage.debugConsole.shareLog')} isVisible={isLimitModalVisible} onConfirm={function () { return setIsLimitModalVisible(false); }} onCancel={function () { return setIsLimitModalVisible(false); }} prompt={translate('initialSettingsPage.debugConsole.logSizeTooLarge', {
            size: CONST_1.default.API_ATTACHMENT_VALIDATIONS.MAX_SIZE / 1024 / 1024,
        })} shouldShowCancelButton={false} confirmText={translate('common.ok')}/>
        </ScreenWrapper_1.default>);
}
ConsolePage.displayName = 'ConsolePage';
exports.default = ConsolePage;
