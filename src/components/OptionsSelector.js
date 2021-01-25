import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import TextInputWithFocusStyles from './TextInputWithFocusStyles';
import OptionsList from './OptionsList';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

const propTypes = {
    onSelectRow: PropTypes.func,
};

const defaultProps = {
    onSelectRow: () => {},
};

class OptionsSelector extends Component {
    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            focusedIndex: 0,
        };
    }

    componentDidMount() {
        this.textInput.focus();
    }

    /**
     * Delegate key presses to specific callbacks
     *
     * @param {SyntheticEvent} e
     */
    handleKeyPress(e) {
        const allOptions = _.reduce(this.props.sections, (prev, curr) => (
            [...prev, ...(curr.data || [])]
        ), []);

        switch (e.nativeEvent.key) {
            case 'Enter': {
                this.props.onSelectRow(allOptions[this.state.focusedIndex]);
                e.preventDefault();
                break;
            }

            case 'Backspace': {
                // this.props.onBackspacePress();
                break;
            }

            case 'ArrowDown': {
                this.setState((prevState) => {
                    let newFocusedIndex = prevState.focusedIndex + 1;

                    // Wrap around to the top of the list
                    if (newFocusedIndex > allOptions.length - 1) {
                        newFocusedIndex = 0;
                    }

                    return {focusedIndex: newFocusedIndex};
                });


                e.preventDefault();
                break;
            }

            case 'ArrowUp': {
                this.setState((prevState) => {
                    let newFocusedIndex = prevState.focusedIndex - 1;

                    // Wrap around to the bottom of the list
                    if (newFocusedIndex < 0) {
                        newFocusedIndex = allOptions.length - 1;
                    }

                    return {focusedIndex: newFocusedIndex};
                });
                e.preventDefault();
                break;
            }

            case 'Tab':
            case 'Escape': {
                break;
            }

            default:
        }
    }

    render() {
        return (
            <View style={[styles.flex1, styles.mt2]}>
                <TextInputWithFocusStyles
                    styleFocusIn={[styles.textInputReversedFocus]}
                    ref={el => this.textInput = el}
                    style={[styles.textInput]}
                    value={this.props.searchValue}
                    onChangeText={this.props.onChangeText}
                    onKeyPress={this.handleKeyPress}
                    placeholder={this.props.placeholderText}
                    placeholderTextColor={themeColors.textSupporting}
                />
                <OptionsList
                    onSelectRow={this.props.onSelectRow}
                    sections={this.props.sections}
                    focusedIndex={this.state.focusedIndex}
                    selectedOptions={this.props.selectedOptions}
                    headerTitle={this.props.headerTitle}
                    canSelectMultipleOptions={this.props.canSelectMultipleOptions}
                    hideSectionHeaders={this.props.hideSectionHeaders}
                    headerMessage={this.props.headerMessage}
                />
            </View>
        );
    }
}

OptionsSelector.defaultProps = defaultProps;
OptionsSelector.propTypes = propTypes;
export default OptionsSelector;
