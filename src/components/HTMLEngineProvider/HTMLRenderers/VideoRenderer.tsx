import React from 'react';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import VideoPlayerPreview from '@components/VideoPlayerPreview';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type VideoRendererProps = CustomRendererProps<TBlock> & {
    /** Key of the element */
    key?: string;
};

function VideoRenderer({tnode, key}: VideoRendererProps) {
    const htmlAttribs = tnode.attributes;
    const attrHref = htmlAttribs.href || htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE] || '';
    const sourceURL = tryResolveUrlFromApiRoot(attrHref);
    const fileName = FileUtils.getFileName(`${sourceURL}`);
    const thumbnailUrl = htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_URL_ATTRIBUTE];
    const width = Number(htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE]);
    const height = Number(htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE]);
    const duration = Number(htmlAttribs[CONST.ATTACHMENT_DURATION_ATTRIBUTE]);

    return (
        <ShowContextMenuContext.Consumer>
            {({report}) => (
                <VideoPlayerPreview
                    key={key}
                    videoUrl={sourceURL}
                    reportID={report?.reportID ?? ''}
                    fileName={fileName}
                    thumbnailUrl={thumbnailUrl}
                    videoDimensions={{width, height}}
                    videoDuration={duration}
                    onShowModalPress={() => {
                        const route = ROUTES.REPORT_ATTACHMENTS.getRoute(report?.reportID ?? '', sourceURL);
                        Navigation.navigate(route);
                    }}
                />
            )}
        </ShowContextMenuContext.Consumer>
    );
}

VideoRenderer.displayName = 'VideoRenderer';

export default VideoRenderer;
