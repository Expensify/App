"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createRandomPolicyCategories;
var falso_1 = require("@ngneat/falso");
function createRandomPolicyCategories(numberOfCategories) {
    if (numberOfCategories === void 0) { numberOfCategories = 0; }
    var categories = {};
    for (var i = 0; i < numberOfCategories; i++) {
        var categoryName = (0, falso_1.randWord)();
        categories[categoryName] = {
            name: categoryName,
            enabled: false,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'GL Code': '',
            unencodedName: categoryName,
            externalID: '',
            areCommentsRequired: false,
            origin: '',
        };
    }
    return categories;
}
