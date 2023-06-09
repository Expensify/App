import _ from 'underscore';
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ScreenWrapper from './ScreenWrapper';
import HeaderWithBackButton from './HeaderWithBackButton';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';
import OptionsSelector from './OptionsSelector';
import styles from '../styles/styles';

const propTypes = {
    /** Title of the page */
    title: PropTypes.string.isRequired,

    /** Function to call when the back button is pressed */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Text to display in the search input label */
    textSearchLabel: PropTypes.string.isRequired,

    /** Placeholder text to display in the search input */
    placeholder: PropTypes.string.isRequired,

    /** Function to call when a row is selected */
    onSelectRow: PropTypes.func.isRequired,

    /** Initial value to display in the search input */
    initialSearchValue: PropTypes.string,

    /** Initial option to display as selected */
    initialOption: PropTypes.string,

    data: PropTypes.arrayOf(
        PropTypes.shape({
            /** Text to display for the option */
            text: PropTypes.string.isRequired,

            /** Value of the option */
            value: PropTypes.string.isRequired,

            /** Key to use for the option in the list */
            keyForList: PropTypes.string.isRequired,
        }),
    ).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    initialSearchValue: '',

    initialOption: '',
};

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

function filterOptions(searchValue, data) {
    const trimmedSearchValue = searchValue.trim();
    if (trimmedSearchValue.length === 0) {
        return [];
    }

    return _.filter(data, (country) => country.text.toLowerCase().includes(searchValue.toLowerCase()));
}

function OptionsSelectorWithSearch(props) {
    const [searchValue, setSearchValue] = useState(props.initialSearchValue);
    const translate = props.translate;
    const initialOption = props.initialOption;

    const filteredData = filterOptions(searchValue, props.data);
    const headerMessage = searchValue.trim() && !filteredData.length ? translate('common.noResultsFound') : '';

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={props.title}
                        shouldShowBackButton
                        onBackButtonPress={props.onBackButtonPress}
                    />
                    <OptionsSelector
                        textInputLabel={props.textSearchLabel}
                        placeholderText={props.placeholder}
                        headerMessage={headerMessage}
                        sections={[{data: filteredData, indexOffset: 0}]}
                        value={searchValue}
                        onSelectRow={props.onSelectRow}
                        onChangeText={setSearchValue}
                        optionHoveredStyle={styles.hoveredComponentBG}
                        safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        shouldFocusOnSelectRow
                        shouldHaveOptionSeparator
                        initiallyFocusedOptionKey={initialOption}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

OptionsSelectorWithSearch.propTypes = propTypes;
OptionsSelectorWithSearch.defaultProps = defaultProps;
OptionsSelectorWithSearch.displayName = 'OptionsSelectorWithSearch';

export {greenCheckmark};

export default withLocalize(OptionsSelectorWithSearch);
