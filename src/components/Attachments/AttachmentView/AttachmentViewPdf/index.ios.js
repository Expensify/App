"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseAttachmentViewPdf_1 = require("./BaseAttachmentViewPdf");
function AttachmentViewPdf(props) {
    return (<BaseAttachmentViewPdf_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
exports.default = (0, react_1.memo)(AttachmentViewPdf);
