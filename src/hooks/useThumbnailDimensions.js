"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useThumbnailDimensions;
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
var useResponsiveLayout_1 = require("./useResponsiveLayout");
function useThumbnailDimensions(width, height) {
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var fixedDimension = shouldUseNarrowLayout ? CONST_1.default.THUMBNAIL_IMAGE.SMALL_SCREEN.SIZE : CONST_1.default.THUMBNAIL_IMAGE.WIDE_SCREEN.SIZE;
    var thumbnailDimensionsStyles = (0, react_1.useMemo)(function () {
        if (!width || !height) {
            return { width: fixedDimension, aspectRatio: CONST_1.default.THUMBNAIL_IMAGE.NAN_ASPECT_RATIO };
        }
        var aspectRatio = (height && width / height) || 1;
        if (width > height) {
            return { width: fixedDimension, aspectRatio: aspectRatio };
        }
        return { height: fixedDimension, aspectRatio: aspectRatio };
    }, [width, height, fixedDimension]);
    return { thumbnailDimensionsStyles: thumbnailDimensionsStyles };
}
