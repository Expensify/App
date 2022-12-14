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

    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

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

const Banner = props => (
    <Hoverable>
        {(isHovered) => {
            const isClickable = props.onClose || props.onPress;
            return (
                <View style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.p5,
                    styles.borderRadiusNormal,
                    isClickable && isHovered ? styles.activeComponentBG : styles.hoveredComponentBG,
                    styles.breakAll,
                    ...props.containerStyles,
                ]}
                >
                    <View style={[styles.flexRow, styles.flexGrow1, styles.mw100, styles.alignItemsCenter]}>
                        {props.shouldShowIcon && (
                            <View style={[styles.mr3]}>
                                <Icon
                                    src={Expensicons.Exclamation}
                                    fill={StyleUtils.getIconFillColor(getButtonState(isClickable && isHovered))}
                                />
                            </View>
                        )}
                        {
                            props.shouldRenderHTML
                                ? <RenderHTML html={props.text} />
                                : <Text style={[...props.textStyles]} onPress={props.onPress}>{props.text}</Text>
                        }
                    </View>
                    {props.shouldShowCloseButton && (
                        <Tooltip text={props.translate('common.close')}>
                            <Pressable
                                onPress={props.onClose}
                                accessibilityRole="button"
                                accessibilityLabel={props.translate('common.close')}
                            >
                                <Icon src={Expensicons.Close} />
                            </Pressable>
                        </Tooltip>
                    )}
                </View>
            );
        }}
    </Hoverable>
);

Banner.propTypes = propTypes;
Banner.defaultProps = defaultProps;
Banner.displayName = 'Banner';

export default compose(
    withLocalize,
    memo,
)(Banner);
