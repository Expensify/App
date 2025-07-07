"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mockFSLibrary;
function mockFSLibrary() {
    jest.mock('@fullstory/react-native', function () {
        var Fullstory = /** @class */ (function () {
            function Fullstory() {
                this.consent = jest.fn();
                this.anonymize = jest.fn();
                this.identify = jest.fn();
            }
            return Fullstory;
        }());
        return {
            FSPage: function () {
                return {
                    start: jest.fn(function () { }),
                };
            },
            default: Fullstory,
        };
    });
}
