import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import KeyboardAvoidingView from './KeyboardAvoidingView';
import ScreenWrapper from './ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import OptionsSelector from './OptionsSelector';
import FixedFooter from './FixedFooter';
import Button from './Button';

const propTypes = {
    /** Title for the form */
    title: PropTypes.string.isRequired,

    /** Function to get search results. Should return an object w/ */
    getSearchResults: PropTypes.func.isRequired,

    /** Function to submit the search result(s) */
    submit: PropTypes.func.isRequired,

    /** Text to display in the submit button for the search form */
    submitButtonText: PropTypes.string,

    /** The maximum number of search results that can be selected */
    maxResults: PropTypes.number,

    /** TODO: Update OptionsListUtils.getHeaderMessage to be more generic */
    headerMessage: PropTypes.string,
};

const defaultProps = {
    submitButtonText: '',
    maxResults: 1,
    headerMessage: '',
};

class SearchForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchValue: '',
            sections: [],
            selectedOptions: [],
        };

        this.updateSearchResults = this.updateSearchResults.bind(this);
        this.toggleOrSubmit = this.toggleOrSubmit.bind(this);
    }

    /**
     * Updates the search result sections with the new search value
     *
     * @param {String} searchValue
     */
    updateSearchResults(searchValue) {
        const sections = [];
        if (this.props.maxResults > 1) {
            sections.push({
                title: undefined,
                data: this.state.selectedOptions,
                shouldShow: true,
                indexOffset: 0,
            });
        }

        if (this.selectedOptions.length < this.props.maxResults) {
            sections.push(...this.props.getSearchResults(searchValue));
        }

        this.setState({
            searchValue: '',
            sections,
        });
    }

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    toggleOption(option) {
        this.setState((prevState) => {
            let newSelectedOptions;
            const isOptionInList = _.some(prevState.selectedOptions, selectedOption => (
                selectedOption.login === option.login
            ));

            if (isOptionInList) {
                // Remove option from selected options
                newSelectedOptions = _.reject(prevState.selectedOptions, selectedOption => (
                    selectedOption.login === option.login
                ));
            } else {
                // Add option to selected options
                newSelectedOptions = [...prevState.selectedOptions, option];
            }

            return {
                selectedOptions: newSelectedOptions,
                searchValue: isOptionInList ? prevState.searchValue : '',
            };
        });
    }

    /**
     * Toggles an option, or submits the form with the selected option if maxResults is 1
     *
     * @param {Object} option
     * @returns {Object|void}
     */
    toggleOrSubmit(option) {
        if (this.maxResults > 1) {
            return this.toggleOption(option);
        }

        this.submit(option);
    }

    render() {
        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <KeyboardAvoidingView>
                        <HeaderWithCloseButton
                            title={this.props.title}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />
                        <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                            <FullScreenLoadingIndicator visible={!didScreenTransitionEnd} />
                            {didScreenTransitionEnd && (
                                <>
                                    <OptionsSelector
                                        canSelectMultipleOptions={this.props.maxResults > 1}
                                        sections={this.state.sections}
                                        selectedOptions={this.state.selectedOptions}
                                        value={this.state.searchValue}
                                        onSelectRow={this.toggleOrSubmit}
                                        onChangeText={this.updateSearchResults}
                                        headerMessage={this.props.headerMessage}
                                        disableArrowKeysActions
                                        hideAdditionalOptionStates
                                        forceTextUnreadStyle
                                    />
                                    {this.props.maxResults > 1 && this.state.selectedOptions.length > 0 && (
                                        <FixedFooter>
                                            <Button
                                                success
                                                onPress={this.props.submit}
                                                style={[styles.w100]}
                                                text={this.props.submitButtonText}
                                            />
                                        </FixedFooter>
                                    )}
                                </>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                )}
            </ScreenWrapper>
        );
    }
}

SearchForm.propTypes = propTypes;
SearchForm.defaultProps = defaultProps;

export default SearchForm;
