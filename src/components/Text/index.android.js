import React from 'react';
import BaseText from './BaseText';
import {defaultProps, propTypes} from './baseTextPropTypes';

class Text extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            truncatedText: typeof props.children === 'string' ? props.children : null,
        };

        this.handleTextLayout = this.handleTextLayout.bind(this);
    }

    handleTextLayout({nativeEvent: {lines}}) {
        if (!this.props.numberOfLines || lines.length <= this.props.numberOfLines) {
            return;
        }

        let newText = '';
        for (let index = 0; index < this.props.numberOfLines; index += 1) {
            newText = `${newText}${lines[index].text}`;
        }

        this.setState({
            truncatedText: `${newText.slice(0, -3)}...`,
        });
    }

    render() {
        return (
            <BaseText
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                numberOfLines={null}
                onTextLayout={this.handleTextLayout}
            >
                {typeof this.props.children === 'string' ? this.state.truncatedText : this.props.children}
            </BaseText>
        );
    }
}

Text.propTypes = propTypes;
Text.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Text {...props} innerRef={ref} />
));
