import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import EnvironmentBadge from './EnvironmentBadge';

const propTypes = {
    children: PropTypes.node.isRequired,

    /** Subtitle of the header */
    subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    /** Should we show the environment badge (dev/stg)?  */
    shouldShowEnvironmentBadge: PropTypes.bool,
};

const defaultProps = {
    shouldShowEnvironmentBadge: false,
    subtitle: '',
};
const ImageHeader = props => (
    <View style={[styles.flex1, styles.flexRow]}>
        <View style={styles.mw100}>
            {props.children}
            {/* If there's no subtitle then display a fragment to avoid an empty space which moves the main title */}
            {_.isString(props.subtitle)
                ? Boolean(props.subtitle) && <Text style={[styles.mutedTextLabel, styles.pre]} numberOfLines={1}>{props.subtitle}</Text>
                : props.subtitle}
        </View>
        {props.shouldShowEnvironmentBadge && (
            <EnvironmentBadge />
        )}
    </View>
);

ImageHeader.displayName = 'ImageHeader';
ImageHeader.propTypes = propTypes;
ImageHeader.defaultProps = defaultProps;
export default ImageHeader;
