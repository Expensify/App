import _ from 'underscore';
import React, {Component, forwardRef} from 'react';
import {View, TouchableWithoutFeedback, TouchableOpacity, Image} from 'react-native';
import styles, {colors} from '../styles/StyleSheet';
import paperClipIcon from '../../assets/images/icon-paper-clip.png';
import sendIcon from '../../assets/images/icon-send.png';
import TextInputFocusable from './TextInputFocusable';

class TextInputWithAttachments extends Component {
    constructor(props) {
        super(props);

        this.state = {
            commentParts: []
        };
    }

    componentDidMount() {
        this.props.forwardedRef({
            focus: () => {},
            clear: () => {},
            setInlineAttachment: (file) => {
                // Take whatever value is in the current text input and push it into comment parts
                this.setState(prevState => ({
                    commentParts: [...prevState.commentParts, this.textInput.value, file],
                }), () => {
                    this.textInput.clear();
                    this.textInput.focus();
                });
            }
        });
    }

    generateContent() {
        return _.map(this.state.commentParts, (part) => {
            if (_.isString(part)) {
                return (
                    <TextInputFocusable
                        multiline
                        style={[styles.textInput, styles.textInputCompose]}
                        defaultValue={part}
                    />
                );
            }
            console.log(part);

            // We have a file
            if (part.uri) {
                return (
                    <Image
                        source={{uri: part.uri}}
                        resizeMode="contain"
                        style={{
                            height: 200,
                            width: 300,
                            flex: 1,
                            margin: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: colors.icon,
                        }}
                    />
                );
            }

            return null;
        });
    }

    render() {
        return (
            <TouchableWithoutFeedback
                onPress={this.props.onFocus}
                onBlur={this.props.onBlur}
            >
                <View
                    style={[
                        this.props.isFocused ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                        styles.chatItemComposeBox,
                        styles.flexRow
                    ]}
                >
                    <TouchableOpacity
                        onPress={this.props.onAttachButtonPress}
                        style={[styles.chatItemAttachButton]}
                        underlayColor={colors.componentBG}
                    >
                        <Image
                            style={[styles.chatItemSubmitButtonIcon]}
                            resizeMode="contain"
                            source={paperClipIcon}
                        />
                    </TouchableOpacity>
                    <View
                        style={[
                            {
                                flexWrap: 'wrap',
                                flex: 1,
                            },
                        ]}
                    >
                        {this.generateContent()}
                        <TextInputFocusable
                            ref={el => this.textInput = el}
                            multiline
                            style={[styles.textInput, styles.textInputCompose, styles.flex1]}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.chatItemSubmitButton, styles.buttonSuccess]}
                        onPress={this.submitForm}
                        underlayColor={colors.componentBG}
                    >
                        <Image
                            resizeMode="contain"
                            style={[styles.chatItemSubmitButtonIcon]}
                            source={sendIcon}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}

export default forwardRef((props, ref) => (
    <TextInputWithAttachments forwardedRef={ref} {...props}/>
));
