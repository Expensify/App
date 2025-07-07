"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Session = require("./actions/Session");
/**
 * Checks if user is anonymous. If true, shows the sign in modal, else,
 * executes the callback.
 */
var interceptAnonymousUser = function (callback) {
    var isAnonymousUser = Session.isAnonymousUser();
    if (isAnonymousUser) {
        Session.signOutAndRedirectToSignIn();
    }
    else {
        callback();
    }
};
exports.default = interceptAnonymousUser;
