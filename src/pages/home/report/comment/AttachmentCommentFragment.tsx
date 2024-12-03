import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';
import RenderCommentHTML from './RenderCommentHTML';

type AttachmentCommentFragmentProps = {
    source: OriginalMessageSource;
    html: string;
    addExtraMargin: boolean;
    styleAsDeleted: boolean;
};

function AttachmentCommentFragment({addExtraMargin, html, source, styleAsDeleted}: AttachmentCommentFragmentProps) {
    const styles = useThemeStyles();
    const isUploading = html.includes(CONST.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE);
    const htmlContent = styleAsDeleted && isUploading ? `<del>${html}</del>` : html;

    return (
        <View style={addExtraMargin ? styles.mt2 : {}}>
            <RenderCommentHTML
                source={source}
                html={htmlContent}
            />
        </View>
    );
}

AttachmentCommentFragment.displayName = 'AttachmentCommentFragment';

export default AttachmentCommentFragment;
