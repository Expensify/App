"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AnchorRenderer_1 = require("./AnchorRenderer");
var CodeRenderer_1 = require("./CodeRenderer");
var DeletedActionRenderer_1 = require("./DeletedActionRenderer");
var EditedRenderer_1 = require("./EditedRenderer");
var EmojiRenderer_1 = require("./EmojiRenderer");
var ImageRenderer_1 = require("./ImageRenderer");
var MentionHereRenderer_1 = require("./MentionHereRenderer");
var MentionReportRenderer_1 = require("./MentionReportRenderer");
var MentionUserRenderer_1 = require("./MentionUserRenderer");
var NextStepEmailRenderer_1 = require("./NextStepEmailRenderer");
var PreRenderer_1 = require("./PreRenderer");
var RBRRenderer_1 = require("./RBRRenderer");
var ShortMentionRenderer_1 = require("./ShortMentionRenderer");
var TaskTitleRenderer_1 = require("./TaskTitleRenderer");
var VideoRenderer_1 = require("./VideoRenderer");
/**
 * This collection defines our custom renderers. It is a mapping from HTML tag type to the corresponding component.
 */
var HTMLEngineProviderComponentList = {
    // Standard HTML tag renderers
    a: AnchorRenderer_1.default,
    code: CodeRenderer_1.default,
    img: ImageRenderer_1.default,
    video: VideoRenderer_1.default,
    // Custom tag renderers
    edited: EditedRenderer_1.default,
    pre: PreRenderer_1.default,
    /* eslint-disable @typescript-eslint/naming-convention */
    'task-title': TaskTitleRenderer_1.default,
    rbr: RBRRenderer_1.default,
    'mention-user': MentionUserRenderer_1.default,
    'mention-report': MentionReportRenderer_1.default,
    'mention-here': MentionHereRenderer_1.default,
    'mention-short': ShortMentionRenderer_1.default,
    emoji: EmojiRenderer_1.default,
    'next-step-email': NextStepEmailRenderer_1.default,
    'deleted-action': DeletedActionRenderer_1.default,
    /* eslint-enable @typescript-eslint/naming-convention */
};
exports.default = HTMLEngineProviderComponentList;
