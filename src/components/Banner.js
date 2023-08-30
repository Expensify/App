import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
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
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import CONST from '../CONST';

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

    /** Styles to be assigned to the Banner container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Styles to be assigned to the Banner text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldRenderHTML: false,
    shouldShowIcon: false,
    shouldShowCloseButton: false,
    onClose: undefined,
    onPress: undefined,
    containerStyles: [],
    textStyles: [],
};

function Banner(props) {
    return (
        <Hoverable>
            {(isHovered) => {
                const isClickable = props.onClose || props.onPress;
                const shouldHighlight = isClickable && isHovered;
                return (
                    <View
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.p5,
                            styles.borderRadiusNormal,
                            shouldHighlight ? styles.activeComponentBG : styles.hoveredComponentBG,
                            styles.breakAll,
                            ...props.containerStyles,
                        ]}
                    >
                        <View style={[styles.flexRow, styles.flexGrow1, styles.mw100, styles.alignItemsCenter]}>
                            {props.shouldShowIcon && (
                                <View style={[styles.mr3]}>
                                    <Icon
                                        src={Expensicons.Exclamation}
                                        fill={StyleUtils.getIconFillColor(getButtonState(shouldHighlight))}
                                    />
                                </View>
                            )}
                            {props.shouldRenderHTML ? (
                                <RenderHTML html={props.text} />
                            ) : (
                                <Text
                                    style={[...props.textStyles]}
                                    onPress={props.onPress}
                                    suppressHighlighting
                                >
                                    {props.text}
                                </Text>
                            )}
                        </View>
                        {props.shouldShowCloseButton && (
                            <Tooltip text={props.translate('common.close')}>
                                <PressableWithFeedback
                                    onPress={props.onClose}
                                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                    accessibilityLabel={props.translate('common.close')}
                                >
                                    <Icon src={Expensicons.Close} />
                                </PressableWithFeedback>
                            </Tooltip>
                        )}
                    </View>
                );
            }}
        </Hoverable>
    );
}

Banner.propTypes = propTypes;
Banner.defaultProps = defaultProps;
Banner.displayName = 'Banner';

export default compose(withLocalize, memo)(Banner);
