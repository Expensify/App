"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createRandomPolicyTags;
var falso_1 = require("@ngneat/falso");
function createRandomPolicyTags(tagListName, numberOfTags) {
    var _a;
    if (numberOfTags === void 0) { numberOfTags = 0; }
    var tags = {};
    for (var i = 0; i < numberOfTags; i++) {
        var tagName = (0, falso_1.randWord)();
        tags[tagName] = {
            name: tagName,
            enabled: true,
        };
    }
    return _a = {},
        _a[tagListName] = {
            name: tagListName,
            orderWeight: 0,
            required: false,
            tags: tags,
        },
        _a;
}
