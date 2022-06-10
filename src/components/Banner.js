import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Hoverable from './Hoverable';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import RenderHTML from './RenderHTML';
import Text from './Text';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';

const propTypes = {
    /** Text to display in the banner. */
    text: PropTypes.string.isRequired,

    /** Should this component render the text as HTML? */
    shouldRenderHTML: PropTypes.bool,
};

const defaultProps = {
    shouldRenderHTML: false,
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
                <View style={[styles.mr3]}>
                    <Icon
                        src={Expensicons.Exclamation}
                        fill={StyleUtils.getIconFillColor(getButtonState(isHovered))}
                    />
                </View>
                {
                    props.shouldRenderHTML
                        ? <RenderHTML html={props.text} />
                        : <Text>{props.text}</Text>
                }
            </View>
        )}
    </Hoverable>
);

Banner.propTypes = propTypes;
Banner.defaultProps = defaultProps;
Banner.displayName = 'Banner';

export default memo(Banner);
