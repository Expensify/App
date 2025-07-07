"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Link = require("@userActions/Link");
var CONST_1 = require("@src/CONST");
var socialList = [
    {
        iconURL: Expensicons.Podcast,
        link: CONST_1.default.SOCIALS.PODCAST,
    },
    {
        iconURL: Expensicons.Twitter,
        link: CONST_1.default.SOCIALS.TWITTER,
    },
    {
        iconURL: Expensicons.Instagram,
        link: CONST_1.default.SOCIALS.INSTAGRAM,
    },
    {
        iconURL: Expensicons.Facebook,
        link: CONST_1.default.SOCIALS.FACEBOOK,
    },
    {
        iconURL: Expensicons.Linkedin,
        link: CONST_1.default.SOCIALS.LINKEDIN,
    },
];
function Socials() {
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.flexRow, styles.flexWrap]}>
            {socialList.map(function (social) { return (<PressableWithoutFeedback_1.default key={social.link} href={social.link} onPress={function (e) {
                e === null || e === void 0 ? void 0 : e.preventDefault();
                Link.openExternalLink(social.link);
            }} accessible={false} style={[styles.mr1, styles.mt1]} shouldUseAutoHitSlop={false}>
                    {function (_a) {
                var hovered = _a.hovered, pressed = _a.pressed;
                return (<Icon_1.default src={social.iconURL} height={variables_1.default.iconSizeLarge} width={variables_1.default.iconSizeLarge} fill={hovered || pressed ? theme.link : theme.textLight}/>);
            }}
                </PressableWithoutFeedback_1.default>); })}
        </react_native_1.View>);
}
Socials.displayName = 'Socials';
exports.default = Socials;
