import React, {PureComponent} from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    /** Url source for the avatar */
    source: PropTypes.string,

    /** Extra styles to pass */
    style: PropTypes.arrayOf(PropTypes.any),

    /** Extra styles to pass to View wrapper */
    containerStyle: PropTypes.arrayOf(PropTypes.any),

    /** Set the size of Avatar */
    size: PropTypes.oneOf(['default', 'small']),
};

const defaultProps = {
    source: '',
    style: [],
    containerStyle: [],
    size: 'default',
};

class Avatar extends PureComponent {
    render() {
        if (!this.props.source) {
            return null;
        }

        return (
            <View style={[...this.props.containerStyle, styles.avatarWrapper]}>
                <Image
                    source={{uri: this.props.source}}
                    style={[
                        this.props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,
                        ...this.props.style,
                    ]}
                />
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
