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

    /** Children view component for this action item */
    children: PropTypes.node,
};

const defaultProps = {
    shouldRenderHTML: false,
    children: null,
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
                ...props.containerStyles,
            ]}
            >
                <View style={[styles.flexRow, styles.flexGrow1, styles.mw100, styles.alignItemsCenter]}>
                    {props.shouldShowIcon && (
                        <View style={[styles.mr3]}>
                            <Icon
                                src={Expensicons.Exclamation}
                                fill={StyleUtils.getIconFillColor(getButtonState(isHovered))}
                            />
                        </View>
                    )}
                    {
                        props.shouldRenderHTML
                            ? <RenderHTML html={props.text} />
                            : <Text style={[...props.textStyles]} onPress={props.onPress}>{props.text}</Text>
                    }
                </View>
                {
                    props.shouldRenderHTML
                        ? <RenderHTML html={props.text} />
                        : <Text>{props.text}</Text>
                }
                {props.children}
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
