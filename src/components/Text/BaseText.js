import React from 'react';
import _ from 'underscore';
// eslint-disable-next-line no-restricted-imports
import {Text as RNText} from 'react-native';
import {defaultProps, propTypes} from './baseTextPropTypes';
import fontFamily from '../../styles/fontFamily';
import variables from '../../styles/variables';

class BaseText extends React.PureComponent {
    render() {
        // eslint-disable-next-line react/destructuring-assignment
        const {
            color,
            fontSize,
            textAlign,
            children,
            family,
            style,
            ...rest
        } = this.props;

        // If the style prop is an array of styles, we need to mix them all together
        const mergedStyles = !_.isArray(this.props.style)
            ? this.props.style
            : _.reduce(this.props.style, (finalStyles, s) => ({
                ...finalStyles,
                ...s,
            }), {});

        const componentStyle = {
            color,
            fontSize,
            textAlign,
            fontFamily: fontFamily[family],
            ...mergedStyles,
        };

        if (!componentStyle.lineHeight && componentStyle.fontSize === variables.fontSizeNormal) {
            componentStyle.lineHeight = variables.fontSizeNormalHeight;
        }

        return (
            <RNText
                allowFontScaling={false}
                ref={(ref) => {
                    if (typeof this.props.innerRef !== 'function') {
                        return;
                    }
                    this.props.innerRef(ref);
                }}
                style={[componentStyle]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            >
                {this.props.children}
            </RNText>
        );
    }
}

BaseText.propTypes = propTypes;
BaseText.defaultProps = defaultProps;

export default BaseText;
