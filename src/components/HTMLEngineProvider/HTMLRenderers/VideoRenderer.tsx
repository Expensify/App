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
    const attachmentID = htmlAttribs[CONST.ATTACHMENT_ID_ATTRIBUTE];

    return (
        <ShowContextMenuContext.Consumer>
            {({report}) => (
                <AttachmentContext.Consumer>
                    {({accountID, type, hashKey, reportID}) => (
                        <VideoPlayerPreview
                            key={key}
                            videoUrl={sourceURL}
                            reportID={reportID ?? report?.reportID}
                            fileName={fileName}
                            thumbnailUrl={thumbnailUrl}
                            videoDimensions={{width, height}}
                            videoDuration={duration}
                            isDeleted={isDeleted}
                            onShowModalPress={() => {
                                if (!sourceURL || !type) {
                                    return;
                                }
                                const isAuthTokenRequired = !!htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE];
                                const route = ROUTES.REPORT_ATTACHMENTS.getRoute({
                                    attachmentID,
                                    reportID: report?.reportID,
                                    type,
                                    source: sourceURL,
                                    accountID,
                                    isAuthTokenRequired,
                                    hashKey,
                                });
                                Navigation.navigate(route);
                            }}
                        />
                    )}
                </AttachmentContext.Consumer>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

export default VideoRenderer;
