import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, Linking} from 'react-native';
import Text from './Text';
import styles from '../styles/styles';

const propTypes = {
    /** Link to open in new tab */
    href: PropTypes.string,

    /** Text content child */
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
        PropTypes.object,
    ]).isRequired,

    /** Additional style props */
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),

    /** Overwrites the default link behavior with a custom callback */
    onPress: PropTypes.func,
};

const defaultProps = {
    href: '',
    style: [],
    onPress: undefined,
};

class TextLink extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            linkHovered: false,
        };

        this.additionalStyles = _.isArray(this.props.style) ? this.props.style : [this.props.style];
    }

    render() {
        return (
            typeof this.props.children === 'string' ?
                <>
                    {this.props.children.split(' ').map((word, i) => (
                        <Pressable
                            key={word}
                            onHoverIn={() => this.setState({linkHovered: true})}
                            onHoverOut={() => this.setState({linkHovered: false})}
                            onPressIn={() => this.setState({linkHovered: true})}
                            onPressOut={() => this.setState({linkHovered: false})}
                            onPress={(e) => {
                                e.preventDefault();
                                if (this.props.onPress) {
                                    this.props.onPress();
                                    return;
                                }
    
                                Linking.openURL(this.props.href);
                            }}
                            accessibilityRole="link"
                            href={this.props.href}
                        >
                            {({hovered, pressed}) => {
                                return (
                                    <Text style={[styles.link, this.state.linkHovered ? styles.linkHovered : undefined, ...this.additionalStyles]}>
                                        {`${word}${i === this.props.children.split(' ').length - 1 ? '' : ' '}`}
                                    </Text>
                                )
                            }}
                        </Pressable> 
                    ))}
                </>
                : 
                <Pressable
                onPress={(e) => {
                    e.preventDefault();
                    if (this.props.onPress) {
                        this.props.onPress();
                        return;
                    }
    
                    Linking.openURL(this.props.href);
                }}
                accessibilityRole="link"
                href={this.props.href}
            >
                {({hovered, pressed}) => (
                    <Text style={[styles.link, (hovered || pressed) ? styles.linkHovered : undefined, ...this.additionalStyles]}>
                        {this.props.children}
                    </Text>
                )}
            </Pressable>
        );
    }
};

TextLink.defaultProps = defaultProps;
TextLink.propTypes = propTypes;
TextLink.displayName = 'TextLink';
export default TextLink;
