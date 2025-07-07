"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchRouterContextProvider = SearchRouterContextProvider;
exports.useSearchRouterContext = useSearchRouterContext;
var react_1 = require("react");
var isSearchTopmostFullScreenRoute_1 = require("@libs/Navigation/helpers/isSearchTopmostFullScreenRoute");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Modal_1 = require("@userActions/Modal");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
var defaultSearchContext = {
    isSearchRouterDisplayed: false,
    openSearchRouter: function () { },
    closeSearchRouter: function () { },
    toggleSearch: function () { },
    registerSearchPageInput: function () { },
    unregisterSearchPageInput: function () { },
};
var Context = react_1.default.createContext(defaultSearchContext);
var isBrowserWithHistory = typeof window !== 'undefined' && typeof window.history !== 'undefined';
var canListenPopState = typeof window !== 'undefined' && typeof window.addEventListener === 'function';
function SearchRouterContextProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(false), isSearchRouterDisplayed = _b[0], setIsSearchRouterDisplayed = _b[1];
    var searchRouterDisplayedRef = (0, react_1.useRef)(false);
    var searchPageInputRef = (0, react_1.useRef)(undefined);
    (0, react_1.useEffect)(function () {
        if (!canListenPopState) {
            return;
        }
        /**
         * Handle browser back/forward navigation
         * When user clicks back/forward, we check the history state:
         * - If state has isSearchModalOpen=true, we show the modal
         * - If state has isSearchModalOpen=false or no state, we hide the modal
         * This creates a proper browser history integration where modal state
         * is part of the navigation history
         */
        var handlePopState = function (event) {
            var state = event.state;
            if (state === null || state === void 0 ? void 0 : state.isSearchModalOpen) {
                setIsSearchRouterDisplayed(true);
                searchRouterDisplayedRef.current = true;
            }
            else {
                setIsSearchRouterDisplayed(false);
                searchRouterDisplayedRef.current = false;
            }
        };
        window.addEventListener('popstate', handlePopState);
        return function () { return window.removeEventListener('popstate', handlePopState); };
    }, []);
    var routerContext = (0, react_1.useMemo)(function () {
        var openSearchRouter = function () {
            if (isBrowserWithHistory) {
                window.history.pushState({ isSearchModalOpen: true }, '');
            }
            (0, Modal_1.close)(function () {
                setIsSearchRouterDisplayed(true);
                searchRouterDisplayedRef.current = true;
            }, false, true);
        };
        var closeSearchRouter = function () {
            setIsSearchRouterDisplayed(false);
            searchRouterDisplayedRef.current = false;
            if (isBrowserWithHistory) {
                var state = window.history.state;
                if (state === null || state === void 0 ? void 0 : state.isSearchModalOpen) {
                    window.history.replaceState({ isSearchModalOpen: false }, '');
                }
            }
        };
        // There are callbacks that live outside of React render-loop and interact with SearchRouter
        // So we need a function that is based on ref to correctly open/close it
        // When user is on `/search` page we focus the Input instead of showing router
        var toggleSearch = function () {
            var _a, _b, _c;
            var searchFullScreenRoutes = (_a = Navigation_1.navigationRef.getRootState()) === null || _a === void 0 ? void 0 : _a.routes.findLast(function (route) { return route.name === NAVIGATORS_1.default.SEARCH_FULLSCREEN_NAVIGATOR; });
            var lastRoute = (_c = (_b = searchFullScreenRoutes === null || searchFullScreenRoutes === void 0 ? void 0 : searchFullScreenRoutes.state) === null || _b === void 0 ? void 0 : _b.routes) === null || _c === void 0 ? void 0 : _c.at(-1);
            var isUserOnSearchPage = (0, isSearchTopmostFullScreenRoute_1.default)() && (lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.name) === SCREENS_1.default.SEARCH.ROOT;
            if (isUserOnSearchPage && searchPageInputRef.current) {
                if (searchPageInputRef.current.isFocused()) {
                    searchPageInputRef.current.blur();
                }
                else {
                    searchPageInputRef.current.focus();
                }
            }
            else if (searchRouterDisplayedRef.current) {
                closeSearchRouter();
            }
            else {
                openSearchRouter();
            }
        };
        var registerSearchPageInput = function (ref) {
            searchPageInputRef.current = ref;
        };
        var unregisterSearchPageInput = function () {
            searchPageInputRef.current = undefined;
        };
        return {
            isSearchRouterDisplayed: isSearchRouterDisplayed,
            openSearchRouter: openSearchRouter,
            closeSearchRouter: closeSearchRouter,
            toggleSearch: toggleSearch,
            registerSearchPageInput: registerSearchPageInput,
            unregisterSearchPageInput: unregisterSearchPageInput,
        };
    }, [isSearchRouterDisplayed, setIsSearchRouterDisplayed]);
    return <Context.Provider value={routerContext}>{children}</Context.Provider>;
}
function useSearchRouterContext() {
    return (0, react_1.useContext)(Context);
}
SearchRouterContextProvider.displayName = 'SearchRouterContextProvider';
