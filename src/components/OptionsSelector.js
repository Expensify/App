import React, {Component} from 'react';
import {View} from 'react-native';
import TextInputWithFocusStyles from './TextInputWithFocusStyles';
import OptionsList from './OptionsList';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

class OptionsSelector extends Component {
    constructor(props) {
        super(props);
        this.updateOptions = this.updateOptions.bind(this);
        // this.selectOption = this.selectOption.bind(this);
        // this.handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            // contacts,
            // recentChats,
            // focusedIndex: 0,
            searchValue: '',
            // userToInvite: null,
        };
    }

    componentDidMount() {
        this.textInput.focus();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedOptions.length !== this.props.selectedOptions.length) {
            this.updateOptions(this.state.searchValue);
        }
    }

    /**
     *
     * @param {String} searchValue
     */
    updateOptions(searchValue) {
        this.setState({searchValue});
    }

    render() {
        return (
            <View style={styles.flex1}>
                <View style={styles.p2}>
                    <TextInputWithFocusStyles
                        styleFocusIn={[styles.textInputReversedFocus]}
                        ref={el => this.textInput = el}
                        style={[styles.textInput, styles.flex1]}
                        value={this.state.searchValue}
                        onChangeText={this.updateOptions}
                        // onKeyPress={this.handleKeyPress}
                        placeholder={this.props.placeholderText}
                        placeholderTextColor={themeColors.textSupporting}
                    />
                    <OptionsList
                        sections={this.props.sections}
                        // focusedIndex={this.state.focusedIndex}
                        // selectedOptions={this.props.selectedOptions}
                        // onSelectRow={this.selectOption}
                        headerTitle={this.props.headerTitle}
                        canSelectMultipleOptions={this.props.canSelectMultipleOptions}
                        hideSectionHeaders={this.props.hideSectionHeaders}

                        // headerMessage={
                        //     (!hasSelectableOptions && this.props.canInviteUsers)
                        //         // eslint-disable-next-line max-len
                        //         ? 'Don\'t see who you\'re looking for? Type their email or phone number to invite them to chat.'
                        //         : this.props.headerMessage
                        // }
                    />
                </View>
            </View>
        );
    }
}

export default OptionsSelector;
