import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View, Pressable} from 'react-native';
import compose from '../libs/compose';
import Hoverable from './Hoverable';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import RenderHTML from './RenderHTML';
import Text from './Text';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';
import Tooltip from './Tooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Text to display in the banner. */
    text: PropTypes.string.isRequired,

    /** Should this component render the left-aligned exclamation icon? */
    shouldShowIcon: PropTypes.bool,

    /** Should this component render a close button? */
    shouldShowCloseButton: PropTypes.bool,

    /** Should this component render the text as HTML? */
    shouldRenderHTML: PropTypes.bool,

    /** Callback called when the close button is pressed */
    onClose: PropTypes.func,

    /** Callback called when the message is pressed */
    onPress: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldRenderHTML: false,
    shouldShowIcon: false,
    shouldShowCloseButton: false,
    onClose: () => {},
    onPress: () => {},
};

const Banner = props => (
    <Hoverable>
        {isHovered => (
            <View style={[
                styles.flexRow,
                styles.alignItemsCenter,
                styles.p5,
                styles.borderRadiusNormal,
                isHovered ? styles.activeComponentBG : styles.hoveredComponentBG,
                styles.breakAll,
            ]}
            >
                {props.shouldShowIcon && (
                    <View style={[styles.mr3]}>
                        <Icon
                            src={Expensicons.Exclamation}
                            fill={StyleUtils.getIconFillColor(getButtonState(isHovered))}
                        />
                    </View>
                )}
                <Pressable
                    onPress={props.onPress}
                >
                    {
                        props.shouldRenderHTML
                            ? <RenderHTML html={props.text} />
                            : <Text>{props.text}</Text>
                    }
                </Pressable>
                {props.shouldShowCloseButton && (
                    <Tooltip text={props.translate('common.close')}>
                        <Pressable
                            onPress={props.onClose}
                            style={[styles.touchableButtonImage, styles.mr0]}
                            accessibilityRole="button"
                            accessibilityLabel={props.translate('common.close')}
                        >
                            <Icon src={Expensicons.Close} />
                        </Pressable>
                    </Tooltip>
                )}
            </View>
        )}
    </Hoverable>
);

Banner.propTypes = propTypes;
Banner.defaultProps = defaultProps;
Banner.displayName = 'Banner';

export default compose(
    withLocalize,
    memo,
)(Banner);
