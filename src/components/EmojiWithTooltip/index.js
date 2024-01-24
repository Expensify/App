import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';

const propTypes = {
    emojiCode: PropTypes.string.isRequired,
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    style: undefined,
};

function EmojiWithTooltip(props) {
    const styles = useThemeStyles();
    const emojiCode = props.emojiCode;
    const emoji = EmojiUtils.findEmojiByCode(emojiCode);
    const emojiName = EmojiUtils.getEmojiName(emoji);
    return (
        <Tooltip
            renderTooltipContent={() => (
                <View style={[styles.alignItemsCenter, styles.ph2]}>
                    <View style={[styles.flexRow, styles.emojiTooltipWrapper]}>
                        <Text
                            key={emojiCode}
                            style={styles.onlyEmojisText}
                        >
                            {emojiCode}
                        </Text>
                    </View>
                    <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>{`:${emojiName}:`}</Text>
                </View>
            )}
        >
            <Text style={props.style}>{emojiCode}</Text>
        </Tooltip>
    );
}

EmojiWithTooltip.propTypes = propTypes;
EmojiWithTooltip.defaultProps = defaultProps;
EmojiWithTooltip.displayName = 'EmojiWithTooltip';

export default EmojiWithTooltip;
