import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import {addAttachmentID} from '@libs/ReportActionsUtils';
import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';
import RenderCommentHTML from './RenderCommentHTML';

type AttachmentCommentFragmentProps = {
    source: OriginalMessageSource;
    html: string;
    addExtraMargin: boolean;
    reportActionID: string;
    styleAsDeleted: boolean;
};

function AttachmentCommentFragment({addExtraMargin, html, source, styleAsDeleted, reportActionID}: AttachmentCommentFragmentProps) {
    const styles = useThemeStyles();
    const htmlContent = addAttachmentID(styleAsDeleted ? `<del>${html}</del>` : html, reportActionID);

    return (
        <View style={addExtraMargin ? styles.mt2 : {}}>
            <RenderCommentHTML
                containsOnlyEmojis={false}
                source={source}
                html={htmlContent}
            />
        </View>
    );
}

AttachmentCommentFragment.displayName = 'AttachmentCommentFragment';

export default AttachmentCommentFragment;
