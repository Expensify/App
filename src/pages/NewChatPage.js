import _ from 'underscore';
import lodashGet from 'lodash';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import personalDetailsPropType from './personalDetailsPropType';
import SearchForm from '../components/SearchForm';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import * as Report from '../libs/actions/Report';
import compose from '../libs/compose';
import * as OptionsListUtils from '../libs/OptionsListUtils';

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


class NewChatPage extends Component {
    constructor(props) {
        super(props);

        this.getHeaderMessage = this.getHeaderMessage.bind(this);
        this.updateChatOptions = this.updateChatOptions.bind(this);
        this.createNewChat = this.createNewChat.bind(this);

        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getNewChatOptions(
            props.reports,
            props.personalDetails,
            props.betas,
        );

        this.state = {
            recentReports,
            personalDetails,
            userToInvite,
        };
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
     * @param {String} searchValue
     * @returns {Array<Object>}
     */
    updateChatOptions(searchValue) {
        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getNewChatOptions(
            this.props.reports,
            this.props.personalDetails,
            this.props.betas,
            searchValue,
        );

        const sections = [];

        sections.push({
            title: this.props.translate('common.recents'),
            data: recentReports,
            shouldShow: !_.isEmpty(recentReports),
            indexOffset: _.reduce(sections, (prev, {data}) => prev + data.length, 0),
        });

        sections.push({
            title: this.props.translate('common.contacts'),
            data: personalDetails,
            shouldShow: !_.isEmpty(personalDetails),
            indexOffset: _.reduce(sections, (prev, {data}) => prev + data.length, 0),
        });

        if (userToInvite) {
            sections.push(({
                title: undefined,
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
     * Creates a new chat with the option
     * @param {Object} option
     */
    createNewChat(option) {
        const login = lodashGet(option, 'login');

        if (_.isEmpty(login)) {
            return;
        }

        Report.fetchOrCreateChatReport([
            this.props.session.email,
            login,
        ]);
    }

    render() {
        return (
            <SearchForm
                title={this.props.translate('sidebarScreen.newChat')}
                getSearchResults={this.updateChatOptions}
                getHeaderMessage={this.getHeaderMessage}
                submit={this.createNewChat}
            />
        );
    }
}

NewChatPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(NewChatPage);
