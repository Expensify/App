import React from 'react';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {AttachmentContext} from '@components/AttachmentContext';
import {isDeletedNode} from '@components/HTMLEngineProvider/htmlEngineUtils';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import VideoPlayerPreview from '@components/VideoPlayerPreview';
import {getFileName} from '@libs/fileDownload/FileUtils';
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
    const attrHref = htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE] || htmlAttribs.src || htmlAttribs.href || '';
    const sourceURL = tryResolveUrlFromApiRoot(attrHref);
    const fileName = getFileName(`${sourceURL}`);
    const thumbnailUrl = tryResolveUrlFromApiRoot(htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_URL_ATTRIBUTE]);
    const width = Number(htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE]);
    const height = Number(htmlAttribs[CONST.ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE]);
    const duration = Number(htmlAttribs[CONST.ATTACHMENT_DURATION_ATTRIBUTE]);
    const isDeleted = isDeletedNode(tnode);

    return (
        <ShowContextMenuContext.Consumer>
            {({report}) => (
                <AttachmentContext.Consumer>
                    {({accountID, type, hashKey}) => (
                        <VideoPlayerPreview
                            key={key}
                            videoUrl={sourceURL}
                            reportID={report?.reportID}
                            fileName={fileName}
                            thumbnailUrl={thumbnailUrl}
                            videoDimensions={{width, height}}
                            videoDuration={duration}
                            isDeleted={isDeleted}
                            onShowModalPress={() => {
                                if (!sourceURL || !type) {
                                    return;
                                }
                                const route = ROUTES.ATTACHMENTS.getRoute(report?.reportID, type, sourceURL, accountID, undefined, undefined, undefined, hashKey);
                                Navigation.navigate(route);
                            }}
                        />
                    )}
                </AttachmentContext.Consumer>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

VideoRenderer.displayName = 'VideoRenderer';

export default VideoRenderer;
