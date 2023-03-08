import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ROUTES from '../../../ROUTES';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../../components/Icon/Expensicons';
import CONST from '../../../CONST';
import OptionsSelector from '../../../components/OptionsSelector';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class PronounsPage extends Component {
    constructor(props) {
        super(props);

        this.loadPronouns = this.loadPronouns.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
        this.getFilteredPronouns = this.getFilteredPronouns.bind(this);

        this.loadPronouns();
        this.state = {
            searchValue: '',
        };
    }

    componentDidUpdate(prevProps) {
        // If the pronouns have changed, we need to update the pronouns list because refreshing the page
        // breaks the component lifecycle, so we need to "manually" reset the component.
        if (prevProps.currentUserPersonalDetails.pronouns === this.props.currentUserPersonalDetails.pronouns) {
            return;
        }

        this.onChangeText();
        this.loadPronouns();
    }

    onChangeText(searchValue = '') {
        this.setState({searchValue});
    }

    /**
     * Returns the pronouns list filtered by searchValue needed for the OptionsSelector.
     * Empty array is returned if the searchValue is empty.
     *
     * @returns {Array}
     */
    getFilteredPronouns() {
        const searchedValue = this.state.searchValue.trim();
        if (searchedValue.length === 0) {
            return [];
        }
        return _.filter(this.pronounsList,
            pronous => pronous.text.toLowerCase().indexOf(searchedValue.toLowerCase()) >= 0);
    }

    /**
     * Loads the pronouns list from the translations and adds the green checkmark icon to the currently selected value.
     *
     * @returns {void}
     */
    loadPronouns() {
        const currentPronouns = lodashGet(this.props.currentUserPersonalDetails, 'pronouns', '');

        this.pronounsList = _.map(this.props.translate('pronouns'), (value, key) => {
            const fullPronounKey = `${CONST.PRONOUNS.PREFIX}${key}`;
            const isCurrentPronouns = fullPronounKey === currentPronouns;

            return {
                text: value,
                value: fullPronounKey,
                keyForList: key,

                // Include the green checkmark icon to indicate the currently selected value
                customIcon: isCurrentPronouns ? greenCheckmark : undefined,

                // This property will make the currently selected value have bold text
                boldStyle: isCurrentPronouns,
            };
        });
    }

    /**
     * @param {Object} selectedPronouns
     */
    updatePronouns(selectedPronouns) {
        PersonalDetails.updatePronouns(selectedPronouns.value);
    }

    render() {
        const filteredPronounsList = this.getFilteredPronouns();

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                {({safeAreaPaddingBottomStyle}) => (
                    <>
                        <HeaderWithCloseButton
                            title={this.props.translate('pronounsPage.pronouns')}
                            shouldShowBackButton
                            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />
                        <Text style={styles.ph5}>
                            {this.props.translate('pronounsPage.isShownOnProfile')}
                        </Text>
                        <OptionsSelector
                            textInputLabel={this.props.translate('pronounsPage.pronouns')}
                            sections={[{data: filteredPronounsList}]}
                            value={this.state.searchValue}
                            onSelectRow={this.updatePronouns}
                            onChangeText={this.onChangeText}
                            optionHoveredStyle={styles.hoveredComponentBG}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            shouldFocusOnSelectRow
                            shouldHaveOptionSeparator
                        />
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

PronounsPage.propTypes = propTypes;
PronounsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(PronounsPage);
