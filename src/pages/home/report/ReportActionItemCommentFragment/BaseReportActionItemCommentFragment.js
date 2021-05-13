import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import styles from '../../../../styles/styles';
import variables from '../../../../styles/variables';
import theme from '../../../../styles/themes/default';
import reportActionItemCommentFragmentPropTypes from './reportActionItemCommentFragmentPropTypes';
import RenderHTML from '../../../../components/RenderHTML';
import Text from '../../../../components/Text';

const propTypes = {
    ...reportActionItemCommentFragmentPropTypes,

    // Whether the fragment should be selectable for native copy/paste functionality
    selectable: PropTypes.bool.isRequired,
};

const BaseReportActionItemCommentFragment = ({
    html, text, isEdited, selectable,
}) => (
    <View style={styles.flexRow}>
        {html !== text
            ? <RenderHTML html={html} debug={false} defaultTextProps={selectable ? {selectable} : {}} />
            : <Text selectable={selectable}>{Str.htmlDecode(text)}</Text>}
        {isEdited && (
            <Text style={[styles.ml1]} fontSize={variables.fontSizeSmall} color={theme.textSupporting}>
                (edited)
            </Text>
        )}
    </View>
);

BaseReportActionItemCommentFragment.propTypes = propTypes;
BaseReportActionItemCommentFragment.displayName = 'ReportActionItemCommentFragment';

export default BaseReportActionItemCommentFragment;
