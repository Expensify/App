import React from 'react';
import VideoPlayerPreview from '@components/VideoPlayerPreview';
import {parseReportRouteParams} from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import htmlRendererPropTypes from './htmlRendererPropTypes';

const propTypes = {
    ...htmlRendererPropTypes,
};

function VideoRenderer(props) {
    const fileName = props.displayName;
    const htmlAttribs = props.tnode.attributes;
    const attrHref = htmlAttribs.href || htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE] || '';
    const sourceURL = tryResolveUrlFromApiRoot(attrHref);
    const thumbnailUrl = htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_URL_ATTRIBUTE];
    const width = htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE];
    const height = htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE];
    const activeRoute = Navigation.getActiveRoute();
    const {reportID} = parseReportRouteParams(activeRoute);

    return (
        <VideoPlayerPreview
            videoUrl={sourceURL}
            fileName={fileName}
            thumbnailUrl={thumbnailUrl}
            videoDimensions={{width, height}}
            showModal={() => {
                const route = ROUTES.REPORT_ATTACHMENTS.getRoute(reportID, sourceURL);
                Navigation.navigate(route);
            }}
        />
    );
}

VideoRenderer.propTypes = propTypes;
VideoRenderer.displayName = 'ImageRenderer';

export default VideoRenderer;
