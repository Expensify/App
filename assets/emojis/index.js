
const __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) {k2 = k;}
              Object.defineProperty(o, k2, {
                  enumerable: true,
                  get () {
                      return m[k];
                  },
              });
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) {k2 = k;}
              o[k2] = m[k];
          });
exports.__esModule = true;
exports.categoryFrequentlyUsed = exports.skinTones = exports.importEmojiLocale = exports.localeEmojis = exports.emojiCodeTableWithSkinTones = exports.emojiNameTable = void 0;
const common_1 = require('./common');

const emojiNameTable = common_1['default'].reduce(function (prev, cur) {
    const newValue = prev;
    if (!('header' in cur) && cur.name) {
        newValue[cur.name] = cur;
    }
    return newValue;
}, {});
exports.emojiNameTable = emojiNameTable;
const emojiCodeTableWithSkinTones = common_1['default'].reduce(function (prev, cur) {
    const newValue = prev;
    if (!('header' in cur)) {
        newValue[cur.code] = cur;
    }
    if ('types' in cur && cur.types) {
        cur.types.forEach(function (type) {
            newValue[type] = cur;
        });
    }
    return newValue;
}, {});
exports.emojiCodeTableWithSkinTones = emojiCodeTableWithSkinTones;
const localeEmojis = {
    en: undefined,
    es: undefined,
};
exports.localeEmojis = localeEmojis;
const importEmojiLocale = function (locale) {
    const normalizedLocale = locale.toLowerCase().split('-').at(0);
    if (!localeEmojis[normalizedLocale]) {
        const emojiImportPromise =
            normalizedLocale === 'en'
                ? Promise.resolve().then(function () {
                      return require('./en');
                  })
                : Promise.resolve().then(function () {
                      return require('./es');
                  });
        return emojiImportPromise.then(function (esEmojiModule) {
            // it is needed because in jest test the modules are imported in double nested default object
            localeEmojis[normalizedLocale] = esEmojiModule['default']['default'] ? esEmojiModule['default']['default'] : esEmojiModule['default'];
        });
    }
    return Promise.resolve();
};
exports.importEmojiLocale = importEmojiLocale;
exports['default'] = common_1['default'];
const common_2 = require('./common');

__createBinding(exports, common_2, 'skinTones');
__createBinding(exports, common_2, 'categoryFrequentlyUsed');
