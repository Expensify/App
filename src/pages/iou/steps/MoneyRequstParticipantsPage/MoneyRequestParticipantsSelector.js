import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as OptionsListUtils from '../../../../libs/OptionsListUtils';
import OptionsSelector from '../../../../components/OptionsSelector';
import ONYXKEYS from '../../../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import CONST from '../../../../CONST';
import personalDetailsPropType from '../../../personalDetailsPropType';
import reportPropTypes from '../../../reportPropTypes';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** Callback to add participants in MoneyRequestModal */
    onAddParticipants: PropTypes.func.isRequired,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    /** padding bottom style of safe area */
    safeAreaPaddingBottomStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    safeAreaPaddingBottomStyle: {},
    personalDetails: {},
    reports: {},
    betas: [],
};

class MoneyRequestParticipantsSelector extends Component {
    constructor(props) {
        super(props);

        this.addSingleParticipant = this.addSingleParticipant.bind(this);
        this.updateOptionsWithSearchTerm = this.updateOptionsWithSearchTerm.bind(this);

        const {recentReports, personalDetails, userToInvite} = this.getRequestOptions();

        this.state = {
            recentReports,
            personalDetails,
            userToInvite,
            searchTerm: '',
        };
    }

    /**
     * @param {string} searchTerm
     * @returns {Object}
     */
    getRequestOptions(searchTerm = '') {
        return OptionsListUtils.getNewChatOptions(
            this.props.reports,
            this.props.personalDetails,
            this.props.betas,
            searchTerm,
            [],
            CONST.EXPENSIFY_EMAILS,

            // If we are using this component in the "Request money" flow then we pass the includeOwnedWorkspaceChats argument so that the current user
            // sees the option to request money from their admin on their own Workspace Chat. These will always be shown in the "Recents" section of the selector
            // along with any other recent chats.
            this.props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
        );
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    getSections() {
        const sections = [];
        let indexOffset = 0;

        sections.push({
            title: this.props.translate('common.recents'),
            data: this.state.recentReports,
            shouldShow: !_.isEmpty(this.state.recentReports),
            indexOffset,
        });
        indexOffset += this.state.recentReports.length;

        sections.push({
            title: this.props.translate('common.contacts'),
            data: this.state.personalDetails,
            shouldShow: !_.isEmpty(this.state.personalDetails),
            indexOffset,
        });
        indexOffset += this.state.personalDetails.length;

        if (this.state.userToInvite && !OptionsListUtils.isCurrentUser(this.state.userToInvite)) {
            sections.push({
                undefined,
                data: [this.state.userToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sections;
    }

    updateOptionsWithSearchTerm(searchTerm = '') {
        const {recentReports, personalDetails, userToInvite} = this.getRequestOptions(searchTerm);
        this.setState({
            searchTerm,
            recentReports,
            userToInvite,
            personalDetails,
        });
    }

    /**
     * Adds a single participant to the request
     *
     * @param {Object} option
     */
    addSingleParticipant(option) {
        this.props.onAddParticipants([option]);
        this.props.onStepComplete();
    }

    render() {
        const headerMessage = OptionsListUtils.getHeaderMessage(
            this.state.personalDetails.length + this.state.recentReports.length !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchTerm,
        );
        return (
            <OptionsSelector
                sections={this.getSections()}
                value={this.state.searchTerm}
                onSelectRow={this.addSingleParticipant}
                onChangeText={this.updateOptionsWithSearchTerm}
                headerMessage={headerMessage}
                textInputLabel={this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                boldStyle
                safeAreaPaddingBottomStyle={this.props.safeAreaPaddingBottomStyle}
            />
        );
    }
}

MoneyRequestParticipantsSelector.propTypes = propTypes;
MoneyRequestParticipantsSelector.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(MoneyRequestParticipantsSelector);
