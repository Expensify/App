"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var IMAGE_TYPES = ['jpg', 'jpeg', 'png'];
var MAX_IMAGE_HEIGHT = 180;
var MAX_IMAGE_WIDTH = 340;
function filterNonUniqueLinks(linkMetadata) {
    var linksMap = new Map();
    var result = [];
    linkMetadata.forEach(function (item) {
        if (!item.url || linksMap.has(item.url)) {
            return;
        }
        linksMap.set(item.url, item.url);
        result.push(item);
    });
    return result;
}
function LinkPreviewer(_a) {
    var _b = _a.linkMetadata, linkMetadata = _b === void 0 ? [] : _b, _c = _a.maxAmountOfPreviews, maxAmountOfPreviews = _c === void 0 ? -1 : _c;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var uniqueLinks = filterNonUniqueLinks(linkMetadata);
    var maxAmountOfLinks = maxAmountOfPreviews >= 0 ? Math.min(maxAmountOfPreviews, linkMetadata.length) : linkMetadata.length;
    var linksToShow = uniqueLinks.slice(0, maxAmountOfLinks);
    return linksToShow.map(function (linkData) {
        if (!linkData && Array.isArray(linkData)) {
            return;
        }
        var description = linkData.description, image = linkData.image, title = linkData.title, logo = linkData.logo, publisher = linkData.publisher, url = linkData.url;
        return (<react_native_1.View style={styles.linkPreviewWrapper} key={url}>
                <react_native_1.View style={styles.flexRow}>
                    {!!logo && (<react_native_1.Image style={styles.linkPreviewLogoImage} source={{ uri: logo.url }}/>)}
                    {!!publisher && (<Text_1.default fontSize={variables_1.default.fontSizeLabel} style={styles.pl2}>
                            {publisher}
                        </Text_1.default>)}
                </react_native_1.View>
                {!!title && !!url && (<TextLink_1.default fontSize={variables_1.default.fontSizeNormal} style={[styles.mv2, StyleUtils.getTextColorStyle(theme.link), styles.alignSelfStart]} href={url}>
                        {title}
                    </TextLink_1.default>)}
                {!!description && <Text_1.default fontSize={variables_1.default.fontSizeNormal}>{description}</Text_1.default>}
                {!!(image === null || image === void 0 ? void 0 : image.type) && IMAGE_TYPES.includes(image.type) && !!image.width && !!image.height && (<react_native_1.Image style={[
                    styles.linkPreviewImage,
                    {
                        aspectRatio: image.width / image.height,
                        maxHeight: Math.min(image.height, MAX_IMAGE_HEIGHT),
                        // Calculate maximum width when image is too tall, so it doesn't move away from left
                        maxWidth: Math.min((Math.min(image.height, MAX_IMAGE_HEIGHT) / image.height) * image.width, MAX_IMAGE_WIDTH),
                    },
                ]} resizeMode="contain" source={{ uri: image.url }}/>)}
            </react_native_1.View>);
    });
}
LinkPreviewer.displayName = 'ReportLinkPreview';
exports.default = LinkPreviewer;
