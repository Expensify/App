import React from 'react';
import PropTypes from 'prop-types';
import PlusSvg from '../../../assets/images/plus.svg';
import colors from '../../styles/colors';

const propTypes = {
    // Fill of the icon
    fill: PropTypes.string,

    // Height of the icon
    height: PropTypes.number,

    // Width of the icon
    width: PropTypes.number,
};

const defaultProps = {
    height: 20,
    width: 20,
    fill: colors.black,
};

// We must use a class component to create an animatable component with the Animated API
// eslint-disable-next-line react/prefer-stateless-function
class PlusIcon extends React.Component {
    render() {
        return (
            <PlusSvg
                height={this.props.height}
                width={this.props.width}
                fill={this.props.fill}
            />
        );
    }
}

PlusIcon.propTypes = propTypes;
PlusIcon.defaultProps = defaultProps;

export default PlusIcon;
