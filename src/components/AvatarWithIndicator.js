import React, {PureComponent} from 'react';
import {
    View, StyleSheet, Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import themeColors from '../styles/themes/default';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import SpinningIndicatorAnimation from '../styles/animation/SpinningIndicatorAnimation';
import Tooltip from './Tooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Is user active? */
    isActive: PropTypes.bool,

    /** URL for the avatar */
    source: PropTypes.string.isRequired,

    /** Avatar size */
    size: PropTypes.string,

    // Whether we show the sync indicator
    isSyncing: PropTypes.bool,

    /** To show a tooltip on hover */
    tooltipText: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isActive: false,
    size: 'default',
    isSyncing: false,
    tooltipText: '',
};

class AvatarWithIndicator extends PureComponent {
    constructor(props) {
        super(props);

        this.animation = new SpinningIndicatorAnimation();
    }

    componentDidMount() {
        if (!this.props.isSyncing) {
            return;
        }

        this.animation.start();
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

    /**
     * Returns user status as text
     *
     * @returns {String}
     */
    userStatus() {
        if (this.props.isSyncing) {
            return this.props.translate('profilePage.syncing');
        }

        if (this.props.isActive) {
            return this.props.translate('profilePage.online');
        }

        if (!this.props.isActive) {
            return this.props.translate('profilePage.offline');
        }
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
                <Tooltip text={this.props.tooltipText}>
                    <Avatar
                        imageStyles={[this.props.size === 'large' ? styles.avatarLarge : null]}
                        source={this.props.source}
                        size={this.props.size}
                    />
                </Tooltip>
                <Tooltip text={this.userStatus()} absolute>
                    <Animated.View style={StyleSheet.flatten(indicatorStyles)}>
                        {this.props.isSyncing && (
                            <Icon
                                src={Expensicons.Sync}
                                fill={themeColors.textReversed}
                                width={6}
                                height={6}
                            />
                        )}
                    </Animated.View>
                </Tooltip>
            </View>
        );
    }
}

AvatarWithIndicator.defaultProps = defaultProps;
AvatarWithIndicator.propTypes = propTypes;
export default withLocalize(AvatarWithIndicator);
