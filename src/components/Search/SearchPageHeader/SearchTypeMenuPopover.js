"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var PopoverMenu_1 = require("@components/PopoverMenu");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useSearchTypeMenu_1 = require("@hooks/useSearchTypeMenu");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Expensicons = require("@src/components/Icon/Expensicons");
function SearchTypeMenuPopover(_a) {
    var queryJSON = _a.queryJSON;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, useSearchTypeMenu_1.default)(queryJSON), isPopoverVisible = _b.isPopoverVisible, delayPopoverMenuFirstRender = _b.delayPopoverMenuFirstRender, openMenu = _b.openMenu, closeMenu = _b.closeMenu, allMenuItems = _b.allMenuItems, DeleteConfirmModal = _b.DeleteConfirmModal, windowHeight = _b.windowHeight;
    var buttonRef = (0, react_1.useRef)(null);
    var unmodifiedPaddings = (0, useSafeAreaPaddings_1.default)().unmodifiedPaddings;
    return (<>
            <Button_1.default innerStyles={[{ backgroundColor: theme.sidebarHover }]} icon={Expensicons.Menu} onPress={openMenu}/>
            {!delayPopoverMenuFirstRender && (<PopoverMenu_1.default menuItems={allMenuItems} isVisible={isPopoverVisible} anchorPosition={styles.createMenuPositionSidebar(windowHeight)} onClose={closeMenu} onItemSelected={closeMenu} anchorRef={buttonRef} shouldUseScrollView shouldUseModalPaddingStyle={false} innerContainerStyle={{ paddingBottom: unmodifiedPaddings.bottom }} shouldAvoidSafariException/>)}
            <DeleteConfirmModal />
        </>);
}
SearchTypeMenuPopover.displayName = 'SearchTypeMenuPopover';
exports.default = SearchTypeMenuPopover;
