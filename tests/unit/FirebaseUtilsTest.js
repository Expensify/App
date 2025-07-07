"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var utils_1 = require("@libs/Firebase/utils");
describe('getAttributes', function () {
    var allAttributes = [
        'accountId',
        'personalDetailsLength',
        'reportActionsLength',
        'reportsLength',
        'policiesLength',
        'transactionsLength',
        'transactionViolationsLength',
        'policyType',
        'policyRole',
    ];
    var checkAttributes = function (attributes, expectedAttributes) {
        expectedAttributes.forEach(function (attr) {
            (0, globals_1.expect)(attributes).toHaveProperty(attr);
        });
        (0, globals_1.expect)(Object.keys(attributes).length).toEqual(expectedAttributes.length);
    };
    it('should return 5 specific attributes', function () {
        var requestedAttributes = ['accountId', 'personalDetailsLength', 'reportActionsLength', 'reportsLength', 'policiesLength'];
        var attributes = utils_1.default.getAttributes(requestedAttributes);
        checkAttributes(attributes, requestedAttributes);
    });
    it('should return all attributes when no array is passed', function () {
        var attributes = utils_1.default.getAttributes();
        checkAttributes(attributes, allAttributes);
    });
    it('should return all attributes when an empty array is passed', function () {
        var attributes = utils_1.default.getAttributes([]);
        checkAttributes(attributes, allAttributes);
    });
});
