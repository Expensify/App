import React, {PureComponent} from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    // Url source for the avatar
    source: PropTypes.string,

    // Extra styles to pass
    style: PropTypes.arrayOf(PropTypes.any),
};

const defaultProps = {
    source: '',
    style: [],
};

class Avatar extends PureComponent {
    render() {
        if (!this.props.source) {
            return null;
        }

        return (
            <Image
                ref={el => this.image = el}
                source={{uri: this.props.source}}
                style={[
                    styles.avatarNormal,
                    ...this.props.style,
                ]}
            />
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
