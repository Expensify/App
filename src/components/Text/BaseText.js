import React from 'react';
import _ from 'underscore';
// eslint-disable-next-line no-restricted-imports
import {Text as RNText} from 'react-native';
import {defaultProps, propTypes} from './baseTextPropTypes';
import fontFamily from '../../styles/fontFamily';
import variables from '../../styles/variables';

class BaseText extends React.PureComponent {
    constructor(props) {
        super(props);

        // If the style prop is an array of styles, we need to mix them all together
        this.mergedStyles = !_.isArray(props.style) ? props.style : _.reduce(props.style, (finalStyles, s) => ({
            ...finalStyles,
            ...s,
        }), {});

        this.componentStyle = {
            color: props.color,
            fontSize: props.fontSize,
            textAlign: props.textAlign,
            fontFamily: fontFamily[props.family],
            ...this.mergedStyles,
        };

        if (!this.componentStyle.lineHeight && this.componentStyle.fontSize === variables.fontSizeNormal) {
            this.componentStyle.lineHeight = variables.fontSizeNormalHeight;
        }
    }

    render() {
        return (
            <RNText
                allowFontScaling={false}
                ref={(ref) => {
                    if (typeof this.props.innerRef !== 'function') {
                        return;
                    }
                    this.props.innerRef(ref);
                }}
                style={[this.componentStyle]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            >
                {this.props.children}
            </RNText>
        );
    }
}

BaseText.propTypes = propTypes;
BaseText.defaultProps = defaultProps;

export default BaseText;
