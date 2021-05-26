import React, {PureComponent} from 'react';
import {
    View, StyleSheet, Animated, Easing,
} from 'react-native';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import themeColors from '../styles/themes/default';
import styles from '../styles/styles';
import Icon from './Icon';
import {Sync} from './Icon/Expensicons';
import {getSyncingStyles} from '../styles/getAvatarWithIndicatorStyles';

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

        this.rotate = new Animated.Value(0);
        this.scale = new Animated.Value(1);
        this.startRotation = this.startRotation.bind(this);
        this.startSyncIndicator = this.startSyncIndicator.bind(this);
        this.stopSyncIndicator = this.stopSyncIndicator.bind(this);
    }

    componentDidMount() {
        if (this.props.isSyncing) {
            this.startSyncIndicator();
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isSyncing && this.props.isSyncing) {
            this.startSyncIndicator();
        } else if (prevProps.isSyncing && !this.props.isSyncing) {
            this.stopSyncIndicator();
        }
    }

    componentWillUnmount() {
        this.stopSyncIndicator();
    }

    /**
     * We need to manually loop the animations as `useNativeDriver` does not work well with Animated.loop.
     *
     * @memberof AvatarWithIndicator
     */
    startRotation() {
        this.rotate.setValue(0);
        Animated.timing(this.rotate, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true,
        }).start(({finished}) => {
            if (finished) {
                this.startRotation();
            }
        });
    }

    /**
     * Start Animation for Indicator
     *
     * @memberof AvatarWithIndicator
     */
    startSyncIndicator() {
        this.startRotation();
        Animated.spring(this.scale, {
            toValue: 1.666,
            tension: 1,
            isInteraction: false,
            useNativeDriver: true,
        }).start();
    }

    /**
     * Stop Animation for Indicator
     *
     * @memberof AvatarWithIndicator
     */
    stopSyncIndicator() {
        Animated.spring(this.scale, {
            toValue: 1,
            tension: 1,
            isInteraction: false,
            useNativeDriver: true,
        }).start(() => {
            this.rotate.resetAnimation();
            this.scale.resetAnimation();
            this.rotate.setValue(0);
        });
    }

    render() {
        const indicatorStyles = [
            styles.alignItemsCenter,
            styles.justifyContentCenter,
            this.props.size === 'large' ? styles.statusIndicatorLarge : styles.statusIndicator,
            this.props.isActive ? styles.statusIndicatorOnline : styles.statusIndicatorOffline,
            getSyncingStyles(this.rotate, this.scale),
        ];

        return (
            <View
                style={[this.props.size === 'large' ? styles.avatarLarge : styles.sidebarAvatar]}
            >
                <Avatar
                    styles={[this.props.size === 'large' ? styles.avatarLarge : null]}
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
