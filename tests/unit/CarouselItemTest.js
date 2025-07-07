"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var CarouselItem_1 = require("@components/Attachments/AttachmentCarousel/CarouselItem");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var PlaybackContext_1 = require("@components/VideoPlayerContexts/PlaybackContext");
var Localize_1 = require("@libs/Localize");
var AttachmentModalContext_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContext");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
describe('CarouselItem', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
    });
    it('should hide flagged attachments initially', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Given a CarouselItem component with a valid attributes
                    (0, react_native_1.render)(<OnyxProvider_1.default>
                <LocaleContextProvider_1.LocaleContextProvider>
                    <PlaybackContext_1.PlaybackContextProvider>
                        <AttachmentModalContext_1.AttachmentModalContextProvider>
                            <CarouselItem_1.default item={{
                            reportActionID: '1',
                            attachmentID: '1_1',
                            source: 'img.jpeg',
                            hasBeenFlagged: true,
                        }} isFocused/>
                        </AttachmentModalContext_1.AttachmentModalContextProvider>
                    </PlaybackContext_1.PlaybackContextProvider>
                </LocaleContextProvider_1.LocaleContextProvider>
            </OnyxProvider_1.default>);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    // Then initially the attachment should be hidden so the reveal button should be displayed.
                    expect(react_native_1.screen.getByTestId('moderationButton')).toHaveTextContent((0, Localize_1.translateLocal)('moderation.revealMessage'));
                    return [2 /*return*/];
            }
        });
    }); });
});
