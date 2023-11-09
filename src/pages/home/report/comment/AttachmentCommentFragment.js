import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import reportActionSourcePropType from '@pages/home/report/reportActionSourcePropType';
import styles from '@styles/styles';
import RenderCommentHTML from './RenderCommentHTML';

const propTypes = {
    /** The reportAction's source */
    source: reportActionSourcePropType.isRequired,

    /** The message fragment's HTML */
    html: PropTypes.string.isRequired,

    /** Should extra margin be added on top of the component? */
    addExtraMargin: PropTypes.bool.isRequired,
};

const AttachmentCommentFragment = ({addExtraMargin, html, source}) => (
    <View style={addExtraMargin ? styles.mt2 : {}}>
        <RenderCommentHTML
            source={source}
            html={html}
        />
    </View>
);

AttachmentCommentFragment.propTypes = propTypes;
AttachmentCommentFragment.displayName = 'AttachmentCommentFragment';

export default AttachmentCommentFragment;
