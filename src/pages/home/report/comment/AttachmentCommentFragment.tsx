import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const htmlContent = styleAsDeleted ? `<del>${html}</del>` : html;
    const containerStyle = addExtraMargin ? styles.mt2 : {};

    return (
        <View style={containerStyle}>
            <RenderCommentHTML
                containsOnlyEmojis={false}
                source={source}
                html={htmlContent}
            />
        </View>
    );
}

AttachmentCommentFragment.displayName = 'AttachmentCommentFragment';

export default React.memo(AttachmentCommentFragment);
