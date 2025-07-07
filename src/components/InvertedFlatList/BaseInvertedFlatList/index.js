"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTOSCROLL_TO_TOP_THRESHOLD = void 0;
var react_1 = require("react");
var FlatList_1 = require("@components/FlatList");
var usePrevious_1 = require("@hooks/usePrevious");
var getInitialPaginationSize_1 = require("./getInitialPaginationSize");
var RenderTaskQueue_1 = require("./RenderTaskQueue");
// Adapted from https://github.com/facebook/react-native/blob/29a0d7c3b201318a873db0d1b62923f4ce720049/packages/virtualized-lists/Lists/VirtualizeUtils.js#L237
function defaultKeyExtractor(item, index) {
    if (item != null) {
        if (typeof item === 'object' && 'key' in item) {
            return item.key;
        }
        if (typeof item === 'object' && 'id' in item) {
            return item.id;
        }
    }
    return String(index);
}
var AUTOSCROLL_TO_TOP_THRESHOLD = 250;
exports.AUTOSCROLL_TO_TOP_THRESHOLD = AUTOSCROLL_TO_TOP_THRESHOLD;
function BaseInvertedFlatList(props, ref) {
    var shouldEnableAutoScrollToTopThreshold = props.shouldEnableAutoScrollToTopThreshold, initialScrollKey = props.initialScrollKey, data = props.data, onStartReached = props.onStartReached, renderItem = props.renderItem, _a = props.keyExtractor, keyExtractor = _a === void 0 ? defaultKeyExtractor : _a, rest = __rest(props, ["shouldEnableAutoScrollToTopThreshold", "initialScrollKey", "data", "onStartReached", "renderItem", "keyExtractor"]);
    // `initialScrollIndex` doesn't work properly with FlatList, this uses an alternative approach to achieve the same effect.
    // What we do is start rendering the list from `initialScrollKey` and then whenever we reach the start we render more
    // previous items, until everything is rendered. We also progressively render new data that is added at the start of the
    // list to make sure `maintainVisibleContentPosition` works as expected.
    var _b = (0, react_1.useState)(function () {
        if (initialScrollKey) {
            return initialScrollKey;
        }
        return null;
    }), currentDataId = _b[0], setCurrentDataId = _b[1];
    var _c = (0, react_1.useState)(true), isInitialData = _c[0], setIsInitialData = _c[1];
    var currentDataIndex = (0, react_1.useMemo)(function () { return (currentDataId === null ? 0 : data.findIndex(function (item, index) { return keyExtractor(item, index) === currentDataId; })); }, [currentDataId, data, keyExtractor]);
    var displayedData = (0, react_1.useMemo)(function () {
        if (currentDataIndex <= 0) {
            return data;
        }
        return data.slice(Math.max(0, currentDataIndex - (isInitialData ? 0 : getInitialPaginationSize_1.default)));
    }, [currentDataIndex, data, isInitialData]);
    var isLoadingData = data.length > displayedData.length;
    var wasLoadingData = (0, usePrevious_1.default)(isLoadingData);
    var dataIndexDifference = data.length - displayedData.length;
    // Queue up updates to the displayed data to avoid adding too many at once and cause jumps in the list.
    var renderQueue = (0, react_1.useMemo)(function () { return new RenderTaskQueue_1.default(); }, []);
    (0, react_1.useEffect)(function () {
        return function () {
            renderQueue.cancel();
        };
    }, [renderQueue]);
    renderQueue.setHandler(function (info) {
        if (!isLoadingData) {
            onStartReached === null || onStartReached === void 0 ? void 0 : onStartReached(info);
        }
        setIsInitialData(false);
        var firstDisplayedItem = displayedData.at(0);
        setCurrentDataId(firstDisplayedItem ? keyExtractor(firstDisplayedItem, currentDataIndex) : '');
    });
    var handleStartReached = (0, react_1.useCallback)(function (info) {
        renderQueue.add(info);
    }, [renderQueue]);
    var handleRenderItem = (0, react_1.useCallback)(function (_a) {
        var item = _a.item, index = _a.index, separators = _a.separators;
        // Adjust the index passed here so it matches the original data.
        return renderItem({ item: item, index: index + dataIndexDifference, separators: separators });
    }, [renderItem, dataIndexDifference]);
    var maintainVisibleContentPosition = (0, react_1.useMemo)(function () {
        var config = {
            // This needs to be 1 to avoid using loading views as anchors.
            minIndexForVisible: data.length ? Math.min(1, data.length - 1) : 0,
        };
        if (shouldEnableAutoScrollToTopThreshold && !isLoadingData && !wasLoadingData) {
            config.autoscrollToTopThreshold = AUTOSCROLL_TO_TOP_THRESHOLD;
        }
        return config;
    }, [data.length, shouldEnableAutoScrollToTopThreshold, isLoadingData, wasLoadingData]);
    var listRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, function () {
        // If we're trying to scroll at the start of the list we need to make sure to
        // render all items.
        var scrollToOffsetFn = function (params) {
            if (params.offset === 0) {
                setCurrentDataId(null);
            }
            requestAnimationFrame(function () {
                var _a;
                (_a = listRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset(params);
            });
        };
        return new Proxy({}, {
            get: function (_target, prop) {
                var _a;
                if (prop === 'scrollToOffset') {
                    return scrollToOffsetFn;
                }
                return (_a = listRef.current) === null || _a === void 0 ? void 0 : _a[prop];
            },
        });
    });
    return (<FlatList_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} ref={listRef} maintainVisibleContentPosition={maintainVisibleContentPosition} inverted data={displayedData} onStartReached={handleStartReached} renderItem={handleRenderItem} keyExtractor={keyExtractor}/>);
}
BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';
exports.default = (0, react_1.forwardRef)(BaseInvertedFlatList);
