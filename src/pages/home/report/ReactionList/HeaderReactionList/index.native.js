import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import Text from '../../../../../components/Text';
import Icon from '../../../../../components/Icon';
import * as Expensicons from '../../../../../components/Icon/Expensicons';
import colors from '../../../../../styles/colors';
import * as StyleUtils from '../../../../../styles/StyleUtils';

const propTypes = {
    /** Children view component for this action item */
    onClose: PropTypes.func.isRequired,

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
    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.emojiReactionListHeader]}>
        <View style={styles.flexRow}>
            <View style={[styles.emojiReactionListHeaderBubble, StyleUtils.getEmojiReactionListHeaderBubbleStyle(props.hasUserReacted)]}>
                <Text style={[styles.emojiReactionText, StyleUtils.getEmojiReactionTextStyle(props.sizeScale)]}>
                    {props.emojiCodes.join('')}
                </Text>
            </View>
            <Text style={[{color: colors.greenSupportingText}, styles.ml2]}>{`:${props.emojiName}:`}</Text>
        </View>

        <TouchableOpacity
            onPress={props.onClose}
            accessibilityRole="button"
            accessibilityLabel={props.translate('common.close')}
        >
            <Icon src={Expensicons.Close} />
        </TouchableOpacity>
    </View>
);

HeaderReactionList.propTypes = propTypes;
HeaderReactionList.defaultProps = defaultProps;
HeaderReactionList.displayName = 'HeaderReactionList';

export default withLocalize(HeaderReactionList);

