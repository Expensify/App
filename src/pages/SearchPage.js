import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import personalDetailsPropType from './personalDetailsPropType';
import SearchForm from '../components/SearchForm';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import Timing from '../libs/actions/Timing';
import CONST from '../CONST';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import * as Report from '../libs/actions/Report';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** All of the personal details for everyone */
    personalDetails: personalDetailsPropType.isRequired,

    /** All reports shared with the user */
    reports: PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
    }).isRequired,

    /** Session of currently logged in user */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,

    ...withLocalizePropTypes,
};

class SearchPage extends Component {
    constructor(props) {
        super(props);

        Timing.start(CONST.TIMING.SEARCH_RENDER);

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
            recentReports,
            personalDetails,
            userToInvite,
        };

        this.getSearchResults = this.getSearchResults.bind(this);
        this.getHeaderMessage = this.getHeaderMessage.bind(this);
        this.selectReport = this.selectReport.bind(this);
    }

    componentDidMount() {
        Timing.end(CONST.TIMING.SEARCH_RENDER);
    }

    /**
     * @param {String} searchValue
     * @returns {Array<Object>}
     */
    getSearchResults(searchValue) {
        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getSearchOptions(
            this.props.reports,
            this.props.personalDetails,
            searchValue,
            this.props.betas,
        );

        const sections = [{
            title: this.props.translate('common.recents'),
            data: recentReports.concat(personalDetails),
            shouldShow: true,
            indexOffset: 0,
        }];

        if (userToInvite) {
            sections.push(({
                undefined,
                data: [userToInvite],
                shouldShow: true,
                indexOffset: 0,
            }));
        }

        this.setState({
            recentReports,
            personalDetails,
            userToInvite,
        });

        return sections;
    }

    /**
     * @param {String} searchValue
     * @returns {String}
     */
    getHeaderMessage(searchValue) {
        return OptionsListUtils.getHeaderMessage(
            !_.isEmpty(this.state.personalDetails) && !_.isEmpty(this.state.recentReports),
            !_.isEmpty(this.state.userToInvite),
            searchValue,
        );
    }

    /**
     * @param {Object} option
     */
    selectReport(option) {
        if (!option) {
            return;
        }

        if (option.reportID) {
            Navigation.navigate(ROUTES.getReportRoute(option.reportID));
        } else {
            Report.fetchOrCreateChatReport([
                this.props.session.email,
                option.login,
            ]);
        }
    }

    render() {
        return (
            <SearchForm
                title={this.props.translate('common.search')}
                getSearchResults={this.getSearchResults}
                getHeaderMessage={this.getHeaderMessage}
                submit={this.selectReport}
            />
        );
    }
}

SearchPage.propTypes = propTypes;

export default compose(
    withLocalize,
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
