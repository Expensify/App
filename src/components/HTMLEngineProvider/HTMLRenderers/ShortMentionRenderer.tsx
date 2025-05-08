import React from 'react';
import type {TextStyle} from 'react-native';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import Text from '@components/Text';
import useShortMentionsList from '@hooks/useShortMentionsList';
import CONST from '@src/CONST';
import MentionHereRenderer from './MentionHereRenderer';
import MentionUserRenderer from './MentionUserRenderer';

function ShortMentionRenderer(props: CustomRendererProps<TText | TPhrasing>) {
    const {mentionsList, currentUserMentions} = useShortMentionsList();

    const mentionValue = 'data' in props.tnode ? props.tnode.data.replace(CONST.UNICODE.LTR, '') : '';

    if (currentUserMentions?.includes(mentionValue)) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <MentionHereRenderer {...props} />;
    }

    if (mentionsList.includes(mentionValue)) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <MentionUserRenderer {...props} />;
    }

    return (
        <Text style={props.style as TextStyle}>
            <TNodeChildrenRenderer tnode={props.tnode} />
        </Text>
    );
}

ShortMentionRenderer.displayName = 'ShortMentionRenderer';

export default ShortMentionRenderer;
