import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../components/OptionsSelector';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import * as Report from '../libs/actions/Report';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import Timing from '../libs/actions/Timing';
import CONST from '../CONST';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';

const propTypes = {
    /* Onyx Props */

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** All of the personal details for everyone */
    personalDetails: personalDetailsPropType.isRequired,

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes).isRequired,

    /** Session of currently logged in user */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,

    /** Window Dimensions Props */
    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

class SearchPage extends Component {
    constructor(props) {
        super(props);

        Timing.start(CONST.TIMING.SEARCH_RENDER);

        this.selectReport = this.selectReport.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
        this.debouncedUpdateOptions = _.debounce(this.updateOptions.bind(this), 75);

        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getSearchOptions(
            props.reports,
            props.personalDetails,
            '',
            props.betas,
        );

        this.state = {
            searchValue: '',
            recentReports,
            personalDetails,
            userToInvite,
        };
    }

    componentDidMount() {
        Timing.end(CONST.TIMING.SEARCH_RENDER);
    }

    onChangeText(searchValue = '') {
        this.setState({searchValue}, this.debouncedUpdateOptions);
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    getSections() {
        const sections = [];
        let indexOffset = 0;

        if (this.state.recentReports.length > 0) {
            sections.push(({
                data: this.state.recentReports,
                shouldShow: true,
                indexOffset,
            }));
            indexOffset += this.state.recentReports.length;
        }

        if (this.state.personalDetails.length > 0) {
            sections.push(({
                data: this.state.personalDetails,
                shouldShow: true,
                indexOffset,
            }));
            indexOffset += this.state.recentReports.length;
        }

        if (this.state.userToInvite) {
            sections.push(({
                data: [this.state.userToInvite],
                shouldShow: true,
                indexOffset,
            }));
        }

        return sections;
    }

    updateOptions() {
        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getSearchOptions(
            this.props.reports,
            this.props.personalDetails,
            this.state.searchValue.trim(),
            this.props.betas,
        );
        this.setState({
            userToInvite,
            recentReports,
            personalDetails,
        });
    }

    /**
     * Reset the search value and redirect to the selected report
     *
     * @param {Object} option
     */
    selectReport(option) {
        if (!option) {
            return;
        }

        if (option.reportID) {
            this.setState({
                searchValue: '',
            }, () => {
                Navigation.navigate(ROUTES.getReportRoute(option.reportID));
            });
        } else {
            Report.navigateToAndOpenReport([option.login]);
        }
    }

    render() {
        const sections = this.getSections();
        const headerMessage = OptionsListUtils.getHeaderMessage(
            (this.state.recentReports.length + this.state.personalDetails.length) !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchValue,
        );
        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <>
                        <HeaderWithCloseButton
                            title={this.props.translate('common.search')}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />
                        <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                            <OptionsSelector
                                sections={sections}
                                value={this.state.searchValue}
                                onSelectRow={this.selectReport}
                                onChangeText={this.onChangeText}
                                headerMessage={headerMessage}
                                hideSectionHeaders
                                hideAdditionalOptionStates
                                showTitleTooltip
                                shouldShowOptions={didScreenTransitionEnd}
                            />
                        </View>
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

SearchPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(SearchPage);
