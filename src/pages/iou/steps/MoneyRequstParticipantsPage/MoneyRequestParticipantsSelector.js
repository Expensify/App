import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as OptionsListUtils from '../../../../libs/OptionsListUtils';
import * as ReportUtils from '../../../../libs/ReportUtils';
import ONYXKEYS from '../../../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import CONST from '../../../../CONST';
import personalDetailsPropType from '../../../personalDetailsPropType';
import reportPropTypes from '../../../reportPropTypes';
import SelectionList from '../../../../components/SelectionList';
import refPropTypes from '../../../../components/refPropTypes';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** A ref to forward to options selector's text input */
    forwardedRef: refPropTypes,

    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** Callback to add participants in MoneyRequestModal */
    onAddParticipants: PropTypes.func.isRequired,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string.isRequired,

    /** Whether the money request is a distance request or not */
    isDistanceRequest: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    forwardedRef: undefined,
    personalDetails: {},
    reports: {},
    betas: [],
    isDistanceRequest: false,
};

class MoneyRequestParticipantsSelector extends Component {
    constructor(props) {
        super(props);

        this.addSingleParticipant = this.addSingleParticipant.bind(this);
        this.updateOptionsWithSearchTerm = this.updateOptionsWithSearchTerm.bind(this);

        const {recentReports, personalDetails, userToInvite} = this.getRequestOptions();

        const formattedRecentReports = _.map(recentReports, (report) => OptionsListUtils.formatMemberForList(report));
        const formattedPersonalDetails = _.map(personalDetails, (personalDetail) => OptionsListUtils.formatMemberForList(personalDetail));
        const formattedUserToInvite = OptionsListUtils.formatMemberForList(userToInvite);

        this.state = {
            recentReports: formattedRecentReports,
            personalDetails: formattedPersonalDetails,
            userToInvite: formattedUserToInvite,
            searchTerm: '',
        };
    }

    componentDidUpdate(prevProps) {
        if (_.isEqual(prevProps.reports, this.props.reports) && _.isEqual(prevProps.personalDetails, this.props.personalDetails)) {
            return;
        }
        this.updateOptionsWithSearchTerm(this.state.searchTerm);
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
            // sees the option to request money from their admin on their own Workspace Chat.
            this.props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,

            // We don't want to include any P2P options like personal details or reports that are not workspace chats for certain features.
            !this.props.isDistanceRequest,
        );
    }

    /**
     * Returns the sections needed for the SelectionList
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

        const formattedRecentReports = _.map(recentReports, (report) => OptionsListUtils.formatMemberForList(report));
        const formattedPersonalDetails = _.map(personalDetails, (personalDetail) => OptionsListUtils.formatMemberForList(personalDetail));
        const formattedUserToInvite = OptionsListUtils.formatMemberForList(userToInvite);

        this.setState({
            recentReports: formattedRecentReports,
            personalDetails: formattedPersonalDetails,
            userToInvite: formattedUserToInvite,
            searchTerm,
        });
    }

    /**
     * Adds a single participant to the request
     *
     * @param {Object} option
     */
    addSingleParticipant(option) {
        this.props.onAddParticipants([
            {
                ...option,
                selected: true,
                icons: _.map(option.icons, (icon) => ({
                    ...icon,
                    // `participants` are stored in Onyx, under the `iou` key. Onyx can't merge the state
                    // if one of the properties is not serializable, so we clean the avatar source when it is a function,
                    // and restore when rendering the list.
                    source: _.isFunction(icon.source) ? '' : icon.source,
                })),
            },
        ]);

        this.props.onStepComplete(option);
    }

    render() {
        const headerMessage = OptionsListUtils.getHeaderMessage(
            this.state.personalDetails.length + this.state.recentReports.length !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchTerm,
        );
        const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(this.props.personalDetails);

        return (
            <SelectionList
                sections={this.getSections()}
                textInputLabel={this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                textInputValue={this.state.searchTerm}
                onSelectRow={this.addSingleParticipant}
                onChangeText={this.updateOptionsWithSearchTerm}
                headerMessage={headerMessage}
                showLoadingPlaceholder={!isOptionsDataReady}
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
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(
    React.forwardRef((props, ref) => (
        <MoneyRequestParticipantsSelector
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            forwardedRef={ref}
        />
    )),
);
