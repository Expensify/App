"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useDeleteSavedSearch;
var react_1 = require("react");
var ConfirmModal_1 = require("@components/ConfirmModal");
var SearchContext_1 = require("@components/Search/SearchContext");
var Search_1 = require("@libs/actions/Search");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var ROUTES_1 = require("@src/ROUTES");
var useLocalize_1 = require("./useLocalize");
function useDeleteSavedSearch() {
    var _a = (0, react_1.useState)(false), isDeleteModalVisible = _a[0], setIsDeleteModalVisible = _a[1];
    var _b = (0, react_1.useState)(0), hashToDelete = _b[0], setHashToDelete = _b[1];
    var translate = (0, useLocalize_1.default)().translate;
    var currentSearchHash = (0, SearchContext_1.useSearchContext)().currentSearchHash;
    var showDeleteModal = function (hash) {
        setIsDeleteModalVisible(true);
        setHashToDelete(hash);
    };
    var handleDelete = function () {
        (0, Search_1.deleteSavedSearch)(hashToDelete);
        setIsDeleteModalVisible(false);
        if (hashToDelete === currentSearchHash) {
            (0, Search_1.clearAdvancedFilters)();
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({
                query: (0, SearchQueryUtils_1.buildCannedSearchQuery)(),
            }));
        }
    };
    function DeleteConfirmModal() {
        return (<ConfirmModal_1.default title={translate('search.deleteSavedSearch')} onConfirm={handleDelete} onCancel={function () { return setIsDeleteModalVisible(false); }} isVisible={isDeleteModalVisible} prompt={translate('search.deleteSavedSearchConfirm')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>);
    }
    return { showDeleteModal: showDeleteModal, DeleteConfirmModal: DeleteConfirmModal };
}
