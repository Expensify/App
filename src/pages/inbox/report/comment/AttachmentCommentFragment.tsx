import useThemeStyles from '@hooks/useThemeStyles';

import {wrapAttachmentAnchorsInBlocks} from '@libs/AttachmentAnchorUtils';
import {getHtmlWithAttachmentID} from '@libs/ReportActionsUtils';
import useSendMessageSpanMarks from '@libs/telemetry/useSendMessageSpanMarks';

import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';

import React from 'react';
import {View} from 'react-native';

import RenderCommentHTML from './RenderCommentHTML';

type AttachmentCommentFragmentProps = {
    source: OriginalMessageSource;
    html: string;
    addExtraMargin: boolean;
    reportActionID?: string;
    styleAsDeleted: boolean;
    isEdited?: boolean;
};

function AttachmentCommentFragment({addExtraMargin, html, source, styleAsDeleted, reportActionID, isEdited = false}: AttachmentCommentFragmentProps) {
    const styles = useThemeStyles();
    const htmlWithIDs = getHtmlWithAttachmentID(styleAsDeleted ? `<del>${html}</del>` : html, reportActionID);
    const attachmentHtml = wrapAttachmentAnchorsInBlocks(htmlWithIDs);
    // Only a file card gets its own block, so only a file card can carry the label without it sharing the card's line.
    const editedTag = isEdited && attachmentHtml !== htmlWithIDs ? `<edited ${styleAsDeleted ? 'deleted' : ''}></edited>` : '';
    const htmlContent = `${attachmentHtml}${editedTag}`;
    const endSendMessageVisibleSpanOnLayout = useSendMessageSpanMarks(reportActionID);

    return (
        <View
            style={addExtraMargin ? styles.mt2 : {}}
            onLayout={endSendMessageVisibleSpanOnLayout}
        >
            <RenderCommentHTML
                containsOnlyEmojis={false}
                source={source}
                html={htmlContent}
            />
        </View>
    );
}

export default AttachmentCommentFragment;
