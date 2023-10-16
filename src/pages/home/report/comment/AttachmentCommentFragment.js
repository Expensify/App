import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import RenderCommentHTML from './RenderCommentHTML';
import reportActionSourcePropType from '../reportActionSourcePropType';

const propTypes = {
    /** The reportAction's source */
    source: reportActionSourcePropType.isRequired,

    /** The message fragment's HTML */
    html: PropTypes.string.isRequired,

    /** Should extra margin be added on top of the component? */
    addExtraMargin: PropTypes.bool.isRequired,
};

function AttachmentCommentFragment(props) {
    return (
        <View style={props.addExtraMargin ? styles.mt2 : {}}>
            <RenderCommentHTML
                source={props.source}
                html={props.html}
            />
        </View>
    );
}

AttachmentCommentFragment.propTypes = propTypes;
AttachmentCommentFragment.displayName = 'AttachmentCommentFragment';

export default AttachmentCommentFragment;
