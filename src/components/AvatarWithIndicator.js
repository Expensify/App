import React, {PureComponent} from 'react';
import {
    View, StyleSheet, Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import themeColors from '../styles/themes/default';
import styles from '../styles/styles';
import Icon from './Icon';
import {Sync} from './Icon/Expensicons';
import SpinningIndicatorAnimation from '../styles/animation/SpinningIndicatorAnimation';

const propTypes = {
    /** Is user active? */
    isActive: PropTypes.bool,

    /** URL for the avatar */
    source: PropTypes.string.isRequired,

    /** Avatar size */
    size: PropTypes.string,

    // Whether we show the sync indicator
    isSyncing: PropTypes.bool,
};

const defaultProps = {
    isActive: false,
    size: 'default',
    isSyncing: false,
};

class AvatarWithIndicator extends PureComponent {
    constructor(props) {
        super(props);

        this.animation = new SpinningIndicatorAnimation();
    }

    componentDidMount() {
        if (this.props.isSyncing) {
            this.animation.start();
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isSyncing && this.props.isSyncing) {
            this.animation.start();
        } else if (prevProps.isSyncing && !this.props.isSyncing) {
            this.animation.stop();
        }
    }

    componentWillUnmount() {
        this.animation.stop();
    }


    render() {
        const indicatorStyles = [
            styles.alignItemsCenter,
            styles.justifyContentCenter,
            this.props.size === 'large' ? styles.statusIndicatorLarge : styles.statusIndicator,
            this.props.isActive ? styles.statusIndicatorOnline : styles.statusIndicatorOffline,
            this.animation.getSyncingStyles(),
        ];

        return (
            <View
                style={[this.props.size === 'large' ? styles.avatarLarge : styles.sidebarAvatar]}
            >
                <Avatar
                    imageStyles={[this.props.size === 'large' ? styles.avatarLarge : null]}
                    source={this.props.source}
                />
                <Animated.View style={StyleSheet.flatten(indicatorStyles)}>
                    {this.props.isSyncing && (
                        <Icon
                            src={Sync}
                            fill={themeColors.textReversed}
                            width={6}
                            height={6}
                        />
                    )}
                </Animated.View>
            </View>
        );
    }
}

AvatarWithIndicator.defaultProps = defaultProps;
AvatarWithIndicator.propTypes = propTypes;
AvatarWithIndicator.displayName = 'AvatarWithIndicator';
export default AvatarWithIndicator;
