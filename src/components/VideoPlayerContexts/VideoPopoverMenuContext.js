"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPopoverMenuContextProvider = VideoPopoverMenuContextProvider;
exports.useVideoPopoverMenuContext = useVideoPopoverMenuContext;
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var fileDownload_1 = require("@libs/fileDownload");
var CONST_1 = require("@src/CONST");
var Context = react_1.default.createContext(null);
function VideoPopoverMenuContextProvider(_a) {
    var children = _a.children;
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(''), source = _b[0], setSource = _b[1];
    var _c = (0, react_1.useState)(CONST_1.default.VIDEO_PLAYER.PLAYBACK_SPEEDS[3]), currentPlaybackSpeed = _c[0], setCurrentPlaybackSpeed = _c[1];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isLocalFile = source && CONST_1.default.ATTACHMENT_LOCAL_URL_PREFIX.some(function (prefix) { return source.startsWith(prefix); });
    var videoPopoverMenuPlayerRef = (0, react_1.useRef)(null);
    var updatePlaybackSpeed = (0, react_1.useCallback)(function (speed) {
        var _a, _b;
        setCurrentPlaybackSpeed(speed);
        (_b = (_a = videoPopoverMenuPlayerRef.current) === null || _a === void 0 ? void 0 : _a.setStatusAsync) === null || _b === void 0 ? void 0 : _b.call(_a, { rate: speed });
    }, [videoPopoverMenuPlayerRef]);
    var downloadAttachment = (0, react_1.useCallback)(function () {
        if (typeof source === 'number' || !source) {
            return;
        }
        (0, fileDownload_1.default)((0, addEncryptedAuthTokenToURL_1.default)(source));
    }, [source]);
    var menuItems = (0, react_1.useMemo)(function () {
        var items = [];
        if (!isOffline && !isLocalFile) {
            // eslint-disable-next-line react-compiler/react-compiler
            items.push({
                icon: Expensicons.Download,
                text: translate('common.download'),
                onSelected: function () {
                    downloadAttachment();
                },
            });
        }
        items.push({
            icon: Expensicons.Meter,
            text: translate('videoPlayer.playbackSpeed'),
            subMenuItems: CONST_1.default.VIDEO_PLAYER.PLAYBACK_SPEEDS.map(function (speed) { return ({
                icon: currentPlaybackSpeed === speed ? Expensicons.Checkmark : undefined,
                text: speed === 1 ? translate('videoPlayer.normal') : speed.toString(),
                onSelected: function () {
                    updatePlaybackSpeed(speed);
                },
                shouldPutLeftPaddingWhenNoIcon: true,
                isSelected: currentPlaybackSpeed === speed,
            }); }),
        });
        return items;
    }, [currentPlaybackSpeed, downloadAttachment, translate, updatePlaybackSpeed, isOffline, isLocalFile]);
    var contextValue = (0, react_1.useMemo)(function () { return ({ menuItems: menuItems, videoPopoverMenuPlayerRef: videoPopoverMenuPlayerRef, currentPlaybackSpeed: currentPlaybackSpeed, updatePlaybackSpeed: updatePlaybackSpeed, setCurrentPlaybackSpeed: setCurrentPlaybackSpeed, setSource: setSource }); }, [menuItems, videoPopoverMenuPlayerRef, currentPlaybackSpeed, updatePlaybackSpeed, setCurrentPlaybackSpeed, setSource]);
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
function useVideoPopoverMenuContext() {
    var videoPopoverMenuContext = (0, react_1.useContext)(Context);
    if (!videoPopoverMenuContext) {
        throw new Error('useVideoPopoverMenuContext must be used within a VideoPopoverMenuContext');
    }
    return videoPopoverMenuContext;
}
VideoPopoverMenuContextProvider.displayName = 'VideoPopoverMenuContextProvider';
