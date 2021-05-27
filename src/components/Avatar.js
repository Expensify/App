import _ from 'underscore';
import React, {PureComponent} from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    /** Url source for the avatar */
    source: PropTypes.string,

    /** Extra styles to pass */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),

    /** Extra styles to pass to View wrapper */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Set the size of Avatar */
    size: PropTypes.oneOf(['default', 'small']),
};

const defaultProps = {
    source: '',
    style: [],
    containerStyles: [],
    size: 'default',
};

class Avatar extends PureComponent {
    render() {
        if (!this.props.source) {
            return null;
        }

        const propsStyle = _.isArray(this.props.style)
            ? this.props.style
            : [this.props.style];

        return (
            <View pointerEvents="none" style={this.props.containerStyles}>
                <Image
                    source={{uri: this.props.source}}
                    style={[
                        this.props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,
                        ...propsStyle,
                    ]}
                />
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
