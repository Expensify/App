import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';
import RenderCommentHTML from './RenderCommentHTML';

type AttachmentCommentFragmentProps = {
    source: OriginalMessageSource;
    html: string;
    addExtraMargin: boolean;
};

function AttachmentCommentFragment({addExtraMargin, html, source}: AttachmentCommentFragmentProps) {
    const styles = useThemeStyles();
    return (
        <View style={addExtraMargin ? styles.mt2 : {}}>
            <RenderCommentHTML
                source={source}
                html={html}
            />
        </View>
    );
}

AttachmentCommentFragment.displayName = 'AttachmentCommentFragment';

export default AttachmentCommentFragment;
