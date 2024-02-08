import React from 'react';
import VideoPlayerPreview from '@components/VideoPlayerPreview';
import * as FileUtils from '@libs/fileDownload/FileUtils';
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
    const htmlAttribs = props.tnode.attributes;
    const attrHref = htmlAttribs.href || htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE] || '';
    const sourceURL = tryResolveUrlFromApiRoot(attrHref);
    const fileName = FileUtils.getFileName(`${sourceURL}`);
    const thumbnailUrl = htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_URL_ATTRIBUTE];
    const width = Number(htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE]);
    const height = Number(htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE]);
    const duration = Number(htmlAttribs[CONST.ATTACHMENT_DURATION_ATTRIBUTE]);
    const activeRoute = Navigation.getActiveRoute();
    const {reportID} = parseReportRouteParams(activeRoute);
    console.log({duration});
    return (
        <VideoPlayerPreview
            videoUrl={sourceURL}
            fileName={fileName}
            thumbnailUrl={thumbnailUrl}
            videoDimensions={{width, height}}
            videoDuration={duration}
            onShowModalPress={() => {
                const route = ROUTES.REPORT_ATTACHMENTS.getRoute(reportID, sourceURL);
                Navigation.navigate(route);
            }}
        />
    );
}

VideoRenderer.propTypes = propTypes;
VideoRenderer.displayName = 'VideoRenderer';

export default VideoRenderer;
