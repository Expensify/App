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
var emojis_1 = require("@assets/emojis");
var EmojiTrie_1 = require("@libs/EmojiTrie");
var EmojiUtils = require("@libs/EmojiUtils");
describe('EmojiTest', function () {
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, emojis_1.importEmojiLocale)('en')];
                case 1:
                    _a.sent();
                    (0, EmojiTrie_1.buildEmojisTrie)('en');
                    return [4 /*yield*/, (0, emojis_1.importEmojiLocale)('es')];
                case 2:
                    _a.sent();
                    (0, EmojiTrie_1.buildEmojisTrie)('es');
                    return [2 /*return*/];
            }
        });
    }); });
    it('matches all the emojis in the list', function () {
        // Given the set of Emojis available in the application
        var emojiMatched = emojis_1.default.every(function (emoji) {
            if (('header' in emoji && emoji.header) || ('spacer' in emoji && emoji.spacer)) {
                return true;
            }
            // When we match every Emoji Code
            var isEmojiMatched = EmojiUtils.containsOnlyEmojis(emoji.code);
            var skinToneMatched = true;
            if ('types' in emoji && emoji.types) {
                // and every skin tone variant of the Emoji code
                skinToneMatched = emoji.types.every(function (emojiWithSkinTone) { return EmojiUtils.containsOnlyEmojis(emojiWithSkinTone); });
            }
            return skinToneMatched && isEmojiMatched;
        });
        // Then it should return true for every Emoji Code
        expect(emojiMatched).toBe(true);
    });
    it('matches emojis for different variants', function () {
        // Given an emoji that has the default Unicode representation when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('👉')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('😪️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('😎️')).toBe(true);
        // Given an emoji that different cross - platform variations when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('🔫️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🛍')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🕍')).toBe(true);
        // Given an emoji that is symbol/numerical when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('*️⃣')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('1️⃣')).toBe(true);
        // Given an emoji that has text-variant when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('❤️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('⁉️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('✳️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('☠️')).toBe(true);
        // Given an emoji that has skin tone attached when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('👶🏽')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('👩🏾')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('👊🏾')).toBe(true);
        // Given an emoji that is composite(family) with 4+ unicode pairs when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('👨‍👩‍👦️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('👩‍👩‍👧‍👦️')).toBe(true);
        // Given an emoji that has a length of 2 (flags) when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('🇺🇲')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🇮🇳')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🇺🇦️')).toBe(true);
        // Given an emoji that belongs to the new version of the dataset, when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('🏋️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🧚‍♀️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('⚰️')).toBe(true);
        // Given an input when we check only single emoji with text, then it should return false
        expect(EmojiUtils.containsOnlyEmojis('😄 is smiley')).toBe(false);
        // Given an input when we check text and multiple emojis, then it should return false
        expect(EmojiUtils.containsOnlyEmojis('Hi 😄👋')).toBe(false);
        // Given an input when we only multiple emojis, then it should return true
        expect(EmojiUtils.containsOnlyEmojis('😄👋')).toBe(true);
        // Given an input when we check only multiple emojis with additional whitespace, then it should return false
        expect(EmojiUtils.containsOnlyEmojis('😄  👋')).toBe(true);
        // Given an emoji with an LTR unicode, when we check if it contains only emoji, then it should return true
        expect(EmojiUtils.containsOnlyEmojis('\u2066😄')).toBe(true);
    });
    it('will not match for non emoji', function () {
        // Given a non-emoji input, when we check if it contains only emoji, then it should return false
        expect(EmojiUtils.containsOnlyEmojis('1')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('a')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('~')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('𝕥𝕖𝕤𝕥')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('𝓣𝓮𝓼𝓽')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('𝕿𝖊𝖘𝖙')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('🆃🅴🆂🆃')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('🅃🄴🅂🅃')).toBe(false);
    });
    it('replaces an emoji code with an emoji and a space', function () {
        var text = 'Hi :smile:';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄 ');
    });
    it('will add a space after the last emoji', function () {
        var text = 'Hi :smile::wave:';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄👋 ');
    });
    it('will add a space after the last emoji if there is text after it', function () {
        var text = 'Hi :smile::wave:space after last emoji';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄👋 space after last emoji');
    });
    it('will add a space after the last emoji if there is invalid emoji after it', function () {
        var text = 'Hi :smile::wave:space when :invalidemoji: present';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄👋 space when :invalidemoji: present');
    });
    it('will not add a space after the last emoji if there if last emoji is immediately followed by a space', function () {
        var text = 'Hi :smile::wave: space after last emoji';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄👋 space after last emoji');
    });
    it('will return correct cursor position', function () {
        var text = 'Hi :smile: there :wave:!';
        expect(EmojiUtils.replaceEmojis(text).cursorPosition).toBe(15);
    });
    it('will return correct cursor position when space is not added by space follows last emoji', function () {
        var text = 'Hi :smile: there!';
        expect(EmojiUtils.replaceEmojis(text).cursorPosition).toBe(6);
    });
    it('will return undefined cursor position when no emoji is replaced', function () {
        var text = 'Hi there!';
        expect(EmojiUtils.replaceEmojis(text).cursorPosition).toBe(undefined);
    });
    it('suggests emojis when typing emojis prefix after colon', function () {
        var text = 'Hi :coffin';
        expect(EmojiUtils.suggestEmojis(text, 'en')).toEqual([{ code: '⚰️', name: 'coffin' }]);
    });
    it('suggests a limited number of matching emojis', function () {
        var _a;
        var text = 'Hi :face';
        var limit = 3;
        expect((_a = EmojiUtils.suggestEmojis(text, 'en', limit)) === null || _a === void 0 ? void 0 : _a.length).toBe(limit);
    });
    it('correct suggests emojis accounting for keywords', function () {
        var thumbEmojisEn = [
            {
                name: 'hand_with_index_finger_and_thumb_crossed',
                code: '🫰',
                types: ['🫰🏿', '🫰🏾', '🫰🏽', '🫰🏼', '🫰🏻'],
            },
            {
                code: '👍',
                name: '+1',
                types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
            },
            {
                code: '👎',
                name: '-1',
                types: ['👎🏿', '👎🏾', '👎🏽', '👎🏼', '👎🏻'],
            },
        ];
        var thumbEmojisEs = [
            {
                code: '👍',
                name: '+1',
                types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
            },
            {
                code: '👎',
                name: '-1',
                types: ['👎🏿', '👎🏾', '👎🏽', '👎🏼', '👎🏻'],
            },
            {
                name: 'mano_con_dedos_cruzados',
                code: '🫰',
                types: ['🫰🏿', '🫰🏾', '🫰🏽', '🫰🏼', '🫰🏻'],
            },
        ];
        expect(EmojiUtils.suggestEmojis(':thumb', 'en')).toEqual(thumbEmojisEn);
        expect(EmojiUtils.suggestEmojis(':thumb', 'es')).toEqual(thumbEmojisEs);
        expect(EmojiUtils.suggestEmojis(':pulgar', 'es')).toEqual([
            {
                code: '🤙',
                name: 'mano_llámame',
                types: ['🤙🏿', '🤙🏾', '🤙🏽', '🤙🏼', '🤙🏻'],
            },
            {
                code: '👍',
                name: '+1',
                types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
            },
            {
                code: '👎',
                name: '-1',
                types: ['👎🏿', '👎🏾', '👎🏽', '👎🏼', '👎🏻'],
            },
            {
                name: 'mano_con_dedos_cruzados',
                code: '🫰',
                types: ['🫰🏿', '🫰🏾', '🫰🏽', '🫰🏼', '🫰🏻'],
            },
        ]);
    });
    describe('splitTextWithEmojis', function () {
        it('should return empty array if no text provided', function () {
            var processedTextArray = EmojiUtils.splitTextWithEmojis(undefined);
            expect(processedTextArray).toEqual([]);
        });
        it('should return empty array if there are no emojis in the text', function () {
            var text = 'Simple text example with several words without emojis.';
            var processedTextArray = EmojiUtils.splitTextWithEmojis(text);
            expect(processedTextArray).toEqual([]);
        });
        it('should split the text with emojis into array', function () {
            var textWithOnlyEmojis = '🙂🙂🙂';
            var textWithEmojis = 'Hello world 🙂🙂🙂 ! 🚀🚀 test2 👍👍🏿 test';
            var textStartsAndEndsWithEmojis = '🙂 Hello world 🙂🙂🙂 ! 🚀🚀️ test2 👍👍🏿 test 🙂';
            expect(EmojiUtils.splitTextWithEmojis(textWithOnlyEmojis)).toEqual([
                { text: '🙂', isEmoji: true },
                { text: '🙂', isEmoji: true },
                { text: '🙂', isEmoji: true },
            ]);
            expect(EmojiUtils.splitTextWithEmojis(textWithEmojis)).toEqual([
                { text: 'Hello world ', isEmoji: false },
                { text: '🙂', isEmoji: true },
                { text: '🙂', isEmoji: true },
                { text: '🙂', isEmoji: true },
                { text: ' ! ', isEmoji: false },
                { text: '🚀', isEmoji: true },
                { text: '🚀', isEmoji: true },
                { text: ' test2 ', isEmoji: false },
                { text: '👍', isEmoji: true },
                { text: '👍🏿', isEmoji: true },
                { text: ' test', isEmoji: false },
            ]);
            expect(EmojiUtils.splitTextWithEmojis(textStartsAndEndsWithEmojis)).toEqual([
                { text: '🙂', isEmoji: true },
                { text: ' Hello world ', isEmoji: false },
                { text: '🙂', isEmoji: true },
                { text: '🙂', isEmoji: true },
                { text: '🙂', isEmoji: true },
                { text: ' ! ', isEmoji: false },
                { text: '🚀', isEmoji: true },
                { text: '🚀️', isEmoji: true },
                { text: ' test2 ', isEmoji: false },
                { text: '👍', isEmoji: true },
                { text: '👍🏿', isEmoji: true },
                { text: ' test ', isEmoji: false },
                { text: '🙂', isEmoji: true },
            ]);
        });
    });
});
