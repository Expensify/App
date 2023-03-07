import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import stylePropTypes from '../styles/stylePropTypes';
import Icon from './Icon';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';
import * as StyleUtils from '../styles/StyleUtils';
import * as Expensicons from './Icon/Expensicons';
import getAvatarDefaultSource from '../libs/getAvatarDefaultSource';
import Image from './Image';
import {withNetwork} from './OnyxProvider';
import networkPropTypes from './networkPropTypes';
import styles from '../styles/styles';
import * as ReportUtils from '../libs/ReportUtils';

const propTypes = {
    /** Source for the avatar. Can be a URL or an icon. */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Extra styles to pass to Image */
    // eslint-disable-next-line react/forbid-prop-types
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: stylePropTypes,

    /** Set the size of Avatar */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /**
     * The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'
     * If the avatar is type === workspace, this fill color will be ignored and decided based on the name prop.
    */
    fill: PropTypes.string,

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL.
    * If the avatar is type === workspace, this fallback icon will be ignored and decided based on the name prop.
    */
    fallbackIcon: PropTypes.func,

    /** Denotes whether it is an avatar or a workspace avatar */
    type: PropTypes.oneOf([CONST.ICON_TYPE_AVATAR, CONST.ICON_TYPE_WORKSPACE]),

    /** Owner of the avatar, typically a login email or workspace name */
    name: PropTypes.string,

    /** Props to detect online status */
    network: networkPropTypes.isRequired,
};

const defaultProps = {
    source: null,
    imageStyles: [],
    containerStyles: [],
    size: CONST.AVATAR_SIZE.DEFAULT,
    fill: themeColors.icon,
    fallbackIcon: Expensicons.FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    name: '',
};

class Avatar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            imageError: false,
        };
    }

    componentDidUpdate(prevProps) {
        const isReconnecting = prevProps.network.isOffline && !this.props.network.isOffline;
        if (!this.state.imageError || !isReconnecting) {
            return;
        }
        this.setState({imageError: false});
    }

    render() {
        if (!this.props.source) {
            return null;
        }

        const isWorkspace = this.props.type === CONST.ICON_TYPE_WORKSPACE;
        const iconSize = StyleUtils.getAvatarSize(this.props.size);

        const imageStyle = [
            StyleUtils.getAvatarStyle(this.props.size),
            ...this.props.imageStyles,
            StyleUtils.getAvatarBorderRadius(this.props.size, this.props.type),
        ];

        const iconStyle = [
            StyleUtils.getAvatarStyle(this.props.size),
            styles.bgTransparent,
            ...this.props.imageStyles,
        ];

        const iconFillColor = isWorkspace ? StyleUtils.getDefaultWorspaceAvatarColor(this.props.name).fill : this.props.fill;
        const fallbackAvatar = isWorkspace ? ReportUtils.getDefaultWorkspaceAvatar(this.props.name) : this.props.fallbackIcon;

        return (
            <View pointerEvents="none" style={this.props.containerStyles}>
                {_.isFunction(this.props.source) || this.state.imageError
                    ? (
                        <View style={iconStyle}>
                            <Icon
                                src={this.state.imageError ? fallbackAvatar : this.props.source}
                                height={iconSize}
                                width={iconSize}
                                fill={this.state.imageError ? themeColors.offline : iconFillColor}
                                additionalStyles={[
                                    StyleUtils.getAvatarBorderStyle(this.props.size, this.props.type),
                                    isWorkspace ? StyleUtils.getDefaultWorspaceAvatarColor(this.props.name) : {},
                                    this.state.imageError ? StyleUtils.getBackgroundColorStyle(themeColors.fallbackIconColor) : {},
                                ]}
                            />
                        </View>
                    )
                    : (
                        <Image
                            source={{uri: this.props.source}}
                            defaultSource={getAvatarDefaultSource(this.props.source)}
                            style={imageStyle}
                            onError={() => this.setState({imageError: true})}
                        />
                    )}
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default withNetwork()(Avatar);
