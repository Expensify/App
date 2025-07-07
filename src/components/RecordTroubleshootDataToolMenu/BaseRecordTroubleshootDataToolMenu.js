"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_device_info_1 = require("react-native-device-info");
var react_native_release_profiler_1 = require("react-native-release-profiler");
var Button_1 = require("@components/Button");
var Switch_1 = require("@components/Switch");
var TestToolRow_1 = require("@components/TestToolRow");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Console_1 = require("@libs/actions/Console");
var ProfilingTool_1 = require("@libs/actions/ProfilingTool");
var Troubleshoot_1 = require("@libs/actions/Troubleshoot");
var Console_2 = require("@libs/Console");
var getPlatform_1 = require("@libs/getPlatform");
var Log_1 = require("@libs/Log");
var memoize_1 = require("@libs/memoize");
var Performance_1 = require("@libs/Performance");
var TestTool_1 = require("@userActions/TestTool");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var package_json_1 = require("../../../package.json");
var RNFS_1 = require("./RNFS");
var Share_1 = require("./Share");
function formatBytes(bytes, decimals) {
    if (decimals === void 0) { decimals = 2; }
    if (!+bytes) {
        return '0 Bytes';
    }
    var k = 1024;
    var dm = decimals < 0 ? 0 : decimals;
    var sizes = ['Bytes', 'KiB', 'MiB', 'GiB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return "".concat(parseFloat((bytes / Math.pow(k, i)).toFixed(dm)), " ").concat(sizes.at(i));
}
// WARNING: When changing this name make sure that the "scripts/symbolicate-profile.ts" script is still working!
var newFileName = "Profile_trace_for_".concat(package_json_1.default.version, ".cpuprofile");
function BaseRecordTroubleshootDataToolMenu(_a) {
    var _b;
    var file = _a.file, onDisableLogging = _a.onDisableLogging, onEnableLogging = _a.onEnableLogging, _c = _a.showShareButton, showShareButton = _c === void 0 ? false : _c, pathToBeUsed = _a.pathToBeUsed, zipRef = _a.zipRef, onDownloadZip = _a.onDownloadZip, _d = _a.showDownloadButton, showDownloadButton = _d === void 0 ? false : _d, displayPath = _a.displayPath;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var shouldRecordTroubleshootData = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHOULD_RECORD_TROUBLESHOOT_DATA, { canBeMissing: true })[0];
    var capturedLogs = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGS, { canBeMissing: true })[0];
    var isProfilingInProgress = (0, useOnyx_1.default)(ONYXKEYS_1.default.APP_PROFILING_IN_PROGRESS, { canBeMissing: true })[0];
    var _e = (0, react_1.useState)(), shareUrls = _e[0], setShareUrls = _e[1];
    var _f = (0, react_1.useState)(false), isDisabled = _f[0], setIsDisabled = _f[1];
    var shouldShowProfileTool = (0, react_1.useMemo)(function () { return (0, TestTool_1.shouldShowProfileTool)(); }, []);
    var onToggleProfiling = (0, react_1.useCallback)(function () {
        var shouldProfiling = !isProfilingInProgress;
        if (shouldProfiling) {
            setShareUrls(undefined);
            memoize_1.Memoize.startMonitoring();
            Performance_1.default.enableMonitoring();
            (0, react_native_release_profiler_1.startProfiling)();
        }
        else {
            Performance_1.default.disableMonitoring();
        }
        (0, ProfilingTool_1.default)();
        return function () {
            Performance_1.default.disableMonitoring();
        };
    }, [isProfilingInProgress]);
    var getAppInfo = (0, react_1.useCallback)(function () {
        return Promise.all([react_native_device_info_1.default.getTotalMemory(), react_native_device_info_1.default.getUsedMemory()]).then(function (_a) {
            var totalMemory = _a[0], usedMemory = _a[1];
            return JSON.stringify({
                appVersion: package_json_1.default.version,
                environment: CONFIG_1.default.ENVIRONMENT,
                platform: (0, getPlatform_1.default)(),
                totalMemory: formatBytes(totalMemory, 2),
                usedMemory: formatBytes(usedMemory, 2),
                memoizeStats: memoize_1.Memoize.stopMonitoring(),
                performance: shouldShowProfileTool ? Performance_1.default.getPerformanceMeasures() : undefined,
            });
        });
    }, [shouldShowProfileTool]);
    var onToggle = function () {
        if (shouldShowProfileTool) {
            onToggleProfiling();
        }
        if (!shouldRecordTroubleshootData) {
            (0, Console_1.setShouldStoreLogs)(true);
            (0, Troubleshoot_1.setShouldRecordTroubleshootData)(true);
            if (onEnableLogging) {
                onEnableLogging();
            }
            return;
        }
        setIsDisabled(true);
        if (!capturedLogs) {
            react_native_1.Alert.alert(translate('initialSettingsPage.troubleshoot.noLogsToShare'));
            (0, Console_1.disableLoggingAndFlushLogs)();
            (0, Troubleshoot_1.setShouldRecordTroubleshootData)(false);
            return;
        }
        var logs = Object.values(capturedLogs);
        var logsWithParsedMessages = (0, Console_2.parseStringifiedMessages)(logs);
        var infoFileName = "App_Info_".concat(package_json_1.default.version, ".json");
        getAppInfo().then(function (appInfo) {
            var _a;
            (_a = zipRef.current) === null || _a === void 0 ? void 0 : _a.file(infoFileName, appInfo);
            onDisableLogging(logsWithParsedMessages).then(function () {
                (0, Console_1.disableLoggingAndFlushLogs)();
                (0, Troubleshoot_1.setShouldRecordTroubleshootData)(false);
                setIsDisabled(false);
            });
        });
    };
    var onStopProfiling = (0, react_1.useMemo)(function () { return (shouldShowProfileTool ? react_native_release_profiler_1.stopProfiling : function () { return Promise.resolve(); }); }, [shouldShowProfileTool]);
    var onDisableSwitch = (0, react_1.useCallback)(function () {
        if ((0, getPlatform_1.default)() === CONST_1.default.PLATFORM.WEB) {
            onStopProfiling(true, newFileName).then(function () {
                onDownloadZip === null || onDownloadZip === void 0 ? void 0 : onDownloadZip();
            });
        }
        else if ((0, getPlatform_1.default)() === CONST_1.default.PLATFORM.DESKTOP) {
            onDownloadZip === null || onDownloadZip === void 0 ? void 0 : onDownloadZip();
        }
        else if ((0, getPlatform_1.default)() === CONST_1.default.PLATFORM.ANDROID) {
            onStopProfiling(true, newFileName).then(function (path) {
                if (!path) {
                    return;
                }
                setShareUrls(["file://".concat(path), "file://".concat(file === null || file === void 0 ? void 0 : file.path)]);
            });
        }
        else {
            onStopProfiling(true, newFileName).then(function (path) {
                if (!path) {
                    return;
                }
                var newFilePath = "".concat(pathToBeUsed, "/").concat(newFileName);
                RNFS_1.default.exists(newFilePath)
                    .then(function (fileExists) {
                    if (!fileExists) {
                        return;
                    }
                    return RNFS_1.default.unlink(newFilePath).then(function () {
                        Log_1.default.hmmm('[ProfilingToolMenu] existing file deleted successfully');
                    });
                })
                    .catch(function (error) {
                    var typedError = error;
                    Log_1.default.hmmm('[ProfilingToolMenu] error checking/deleting existing file: ', typedError.message);
                })
                    .then(function () {
                    RNFS_1.default.copyFile(path, newFilePath)
                        .then(function () {
                        Log_1.default.hmmm('[ProfilingToolMenu] file copied successfully');
                        setShareUrls(["file://".concat(newFilePath), "file://".concat(file === null || file === void 0 ? void 0 : file.path)]);
                    })
                        .catch(function (err) {
                        console.error('[ProfilingToolMenu] error copying file: ', err);
                    });
                })
                    .catch(function (error) {
                    console.error('[ProfilingToolMenu] error copying file: ', error);
                    Log_1.default.hmmm('[ProfilingToolMenu] error copying file: ', error);
                });
            });
        }
    }, [file === null || file === void 0 ? void 0 : file.path, onDownloadZip, onStopProfiling, pathToBeUsed]);
    (0, react_1.useEffect)(function () {
        if (!file) {
            return;
        }
        onDisableSwitch();
    }, [file, onDisableSwitch]);
    var onShare = function () {
        Share_1.default.open({
            urls: shareUrls,
        });
    };
    var onDownloadProfiling = function () {
        onStopProfiling(true, newFileName);
    };
    return (<>
            <TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.recordTroubleshootData')}>
                <Switch_1.default accessibilityLabel={translate('initialSettingsPage.troubleshoot.recordTroubleshootData')} isOn={!!shouldRecordTroubleshootData} onToggle={onToggle} disabled={isDisabled}/>
            </TestToolRow_1.default>
            {((_b = shareUrls === null || shareUrls === void 0 ? void 0 : shareUrls.length) !== null && _b !== void 0 ? _b : 0) > 0 && showShareButton && (<>
                    <Text_1.default style={[styles.textLabelSupporting, styles.mb4]}>{"path: ".concat(displayPath)}</Text_1.default>
                    <TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.results')}>
                        <Button_1.default small text={translate('common.share')} onPress={onShare}/>
                    </TestToolRow_1.default>
                </>)}
            {showDownloadButton && !!(file === null || file === void 0 ? void 0 : file.path) && (<TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.profileTrace')}>
                    <Button_1.default small text={translate('common.download')} onPress={onDownloadProfiling}/>
                </TestToolRow_1.default>)}
        </>);
}
BaseRecordTroubleshootDataToolMenu.displayName = 'BaseRecordTroubleshootDataToolMenu';
exports.default = BaseRecordTroubleshootDataToolMenu;
