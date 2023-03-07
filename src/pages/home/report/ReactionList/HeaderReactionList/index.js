import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import Text from '../../../../../components/Text';
import colors from '../../../../../styles/colors';
import * as StyleUtils from '../../../../../styles/StyleUtils';

const propTypes = {
    /** Selected emoji */
    /** The emoji codes */
    emojiCodes: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** The name of the emoji */
    emojiName: PropTypes.string.isRequired,

    /**
     * The default size of the reaction bubble is defined
     * by the styles in styles.js. This scale factor can be used
     * to make the bubble bigger or smaller.
     */
    sizeScale: PropTypes.number,

    ...withLocalizePropTypes,
};

const defaultProps = {
    sizeScale: 1,
};

const HeaderReactionList = props => (
    <View style={[styles.pt4, styles.mh5, styles.emojiReactionListHeader]}>
        <View style={[styles.flexRow]}>
            <View style={[styles.emojiReactionListHeaderBubble, StyleUtils.getEmojiReactionListHeaderBubbleStyle(props.hasUserReacted)]}>
                <Text style={[styles.emojiReactionText, StyleUtils.getEmojiReactionTextStyle(props.sizeScale)]}>
                    {props.emojiCodes.join('')}
                </Text>
            </View>
            <Text style={[{color: colors.greenSupportingText}, styles.ml2]}>{`:${props.emojiName}:`}</Text>
        </View>
    </View>
);

HeaderReactionList.propTypes = propTypes;
HeaderReactionList.defaultProps = defaultProps;
HeaderReactionList.displayName = 'HeaderReactionList';

export default withLocalize(HeaderReactionList);

