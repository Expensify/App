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

const propTypes = {
    // Is user active?
    isActive: PropTypes.bool,

    // url for the avatar
    source: PropTypes.string.isRequired,

    // avatar size
    size: PropTypes.string,

    // Whether true, shows sync indicator
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

    startSyncIndicator() {
        Animated.loop(Animated.timing(this.rotate, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true,
        })).start();
        Animated.spring(this.scale, {
            toValue: 1.35,
            tension: 1,
            isInteraction: false,
            useNativeDriver: true,
        }).start();
    }

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
            {
                transform: [{
                    rotate: this.rotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '-360deg'],
                    }),
                }, {
                    scale: this.scale,
                }],
            },
            this.props.isSyncing ? styles.statusIndicatorSyncing : null,
            this.props.size === 'large' ? styles.statusIndicatorLarge : styles.statusIndicator,
            this.props.isActive ? styles.statusIndicatorOnline : styles.statusIndicatorOffline,
        ];

        return (
            <View
                style={[this.props.size === 'large' ? styles.avatarLarge : styles.sidebarAvatar]}
            >
                <Avatar
                    style={[this.props.size === 'large' ? styles.avatarLarge : null]}
                    source={this.props.source}
                />
                <Animated.View style={StyleSheet.flatten(indicatorStyles)}>
                    {this.props.isSyncing && (
                        <Icon
                            src={Sync}
                            fill={themeColors.textReversed}
                            width="100%"
                            height="100%"
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
