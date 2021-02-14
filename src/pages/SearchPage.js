import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../components/OptionsSelector';
import {getSearchOptions} from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import KeyboardSpacer from '../components/KeyboardSpacer';
import {redirect} from '../libs/actions/App';
import ROUTES from '../ROUTES';
import {hide as hideSidebar} from '../libs/actions/Sidebar';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';

const personalDetailsPropTypes = PropTypes.shape({
    // The login of the person (either email or phone number)
    login: PropTypes.string.isRequired,

    // The URL of the person's avatar (there should already be a default avatarURL if
    // the person doesn't have their own avatar uploaded yet)
    avatarURL: PropTypes.string.isRequired,

    // This is either the user's full name, or their login if full name is an empty string
    displayName: PropTypes.string.isRequired,
});

const propTypes = {
    /* Onyx Props */

    // All of the personal details for everyone
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes).isRequired,

    // All reports shared with the user
    reports: PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
    }).isRequired,

    // Session of currently logged in user
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,

    /* Window Dimensions Props */
    ...windowDimensionsPropTypes,
};

class SearchPage extends Component {
    constructor(props) {
        super(props);

        this.selectReport = this.selectReport.bind(this);

        const {
            recentReports,
        } = getSearchOptions(
            props.reports,
            props.personalDetails,
            '',
        );

        this.state = {
            searchValue: '',
            recentReports,
        };
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    getSections() {
        return [{
            title: 'RECENT',
            data: this.state.recentReports,
            shouldShow: true,
            indexOffset: 0,
        }];
    }

    /**
     * Reset the search value and redirect to the selected report
     *
     * @param {Object} option
     */
    selectReport(option) {
        this.setState({
            searchValue: '',
        }, () => {
            if (this.props.isSmallScreenWidth) {
                hideSidebar();
            }
            redirect(ROUTES.getReportRoute(option.reportID));
        });
    }

    render() {
        const sections = this.getSections();

        return (
            <>
                <View style={[styles.flex1, styles.w100]}>
                    <OptionsSelector
                        sections={sections}
                        value={this.state.searchValue}
                        onSelectRow={this.selectReport}
                        onChangeText={(searchValue = '') => {
                            const {
                                recentReports,
                            } = getSearchOptions(
                                this.props.reports,
                                this.props.personalDetails,
                                searchValue,
                            );
                            this.setState({
                                searchValue,
                                recentReports,
                            });
                        }}
                        hideSectionHeaders
                        hideAdditionalOptionStates
                    />
                </View>
                <KeyboardSpacer />
            </>
        );
    }
}

SearchPage.propTypes = propTypes;
SearchPage.displayName = 'SearchPage';

export default withWindowDimensions(withOnyx({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(SearchPage));
