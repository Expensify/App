"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
var CONFIG_1 = require("@src/CONFIG");
var unreadTotalCount = 0;
/**
 * Set the page title on web
 */
var updateUnread = function (totalCount) {
    var hasUnread = totalCount !== 0;
    unreadTotalCount = totalCount;
    // This setTimeout is required because due to how react rendering messes with the DOM, the document title can't be modified synchronously, and we must wait until all JS is done
    // running before setting the title.
    setTimeout(function () {
        // There is a Chrome browser bug that causes the title to revert back to the previous when we are navigating back. Setting the title to an empty string
        // seems to improve this issue.
        document.title = '';
        document.title = hasUnread ? "(".concat(totalCount, ") ").concat(CONFIG_1.default.SITE_TITLE) : CONFIG_1.default.SITE_TITLE;
        var favicon = document.getElementById('favicon');
        if (favicon instanceof HTMLLinkElement) {
            favicon.href = hasUnread ? CONFIG_1.default.FAVICON.UNREAD : CONFIG_1.default.FAVICON.DEFAULT;
        }
    }, 0);
};
window.addEventListener('popstate', function () {
    updateUnread(unreadTotalCount);
});
exports.default = updateUnread;
