import React, {PureComponent} from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import armchair from '../../assets/images/armchair.svg'

const propTypes = {
    /** Url source for the avatar */
    source: PropTypes.string,

    /** Extra styles to pass to Image */
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Set the size of Avatar */
    size: PropTypes.oneOf(['default', 'small']),
};

const defaultProps = {
    source: '',
    imageStyles: [],
    containerStyles: [],
    size: 'default',
};

class Avatar extends PureComponent {
    render() {
        if (!this.props.source) {
            return null;
        }

        return (
            <View pointerEvents="none" style={this.props.containerStyles}>
                <Image
                    source={{uri: this.props.source}}
                    style={[
                        this.props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,
                        ...this.props.imageStyles,
                    ]}
                />
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
