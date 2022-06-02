import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Hoverable from './Hoverable';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import RenderHTML from './RenderHTML';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';

const propTypes = {
    /** HTML to display in the banner. */
    html: PropTypes.string.isRequired,
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
                <RenderHTML html={props.html} />
            </View>
        )}
    </Hoverable>
);

Banner.propTypes = propTypes;
Banner.displayName = 'Banner';

export default memo(Banner);
