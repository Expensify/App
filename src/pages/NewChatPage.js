import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../components/OptionsSelector';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import * as Report from '../libs/actions/Report';
import CONST from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';

const propTypes = {
    /** Whether screen is used to create group chat */
    isGroupChat: PropTypes.bool,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: personalDetailsPropType,

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isGroupChat: false,
    betas: [],
    personalDetails: {},
    reports: {},
};

const NewChatPage = (props) => {
    const excludedGroupEmails = _.without(CONST.EXPENSIFY_EMAILS, CONST.EMAIL.CONCIERGE);

    const [searchTerm, setSearchTerm] = useState('');
    const [recentReports, setRecentReports] = useState(initialRecentReports);
    const [personalDetails, setPersonalDetails] = useState(initialPersonalDetails);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [userToInvite, setUserToInvite] = useState(initialUserToInvite);

    useEffect(() => {
        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getNewChatOptions(
            props.reports,
            props.personalDetails,
            props.betas,
            '',
            [],
            props.isGroupChat ? excludedGroupEmails : [],
        );

        setRecentReports(recentReports);
        setPersonalDetails(personalDetails);
        setUserToInvite(userToInvite);
    }, []);

    

    
};

class NewChatPage extends Component {
    constructor(props) {
        super(props);

        this.toggleOption = this.toggleOption.bind(this);
        this.createChat = this.createChat.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.updateOptionsWithSearchTerm = this.updateOptionsWithSearchTerm.bind(this);
        this.excludedGroupEmails = _.without(CONST.EXPENSIFY_EMAILS, CONST.EMAIL.CONCIERGE);

        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getNewChatOptions(
            props.reports,
            props.personalDetails,
            props.betas,
            '',
            [],
            this.props.isGroupChat ? this.excludedGroupEmails : [],
        );
        this.state = {
            searchTerm: '',
            recentReports,
            personalDetails,
            selectedOptions: [],
            userToInvite,
        };
    }



    render() {
        const maxParticipantsReached = this.state.selectedOptions.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
        const sections = this.getSections(maxParticipantsReached);
        const headerMessage = OptionsListUtils.getHeaderMessage(
            (this.state.personalDetails.length + this.state.recentReports.length) !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchTerm,
            maxParticipantsReached,
        );
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                    <>
                        <HeaderWithCloseButton
                            title={this.props.isGroupChat
                                ? this.props.translate('sidebarScreen.newGroup')
                                : this.props.translate('sidebarScreen.newChat')}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />
                        <View style={[styles.flex1, styles.w100, styles.pRelative, this.state.selectedOptions.length > 0 ? safeAreaPaddingBottomStyle : {}]}>
                            {didScreenTransitionEnd ? (
                                <OptionsSelector
                                    canSelectMultipleOptions={this.props.isGroupChat}
                                    sections={sections}
                                    selectedOptions={this.state.selectedOptions}
                                    value={this.state.searchTerm}
                                    onSelectRow={option => (this.props.isGroupChat ? this.toggleOption(option) : this.createChat(option))}
                                    onChangeText={this.updateOptionsWithSearchTerm}
                                    headerMessage={headerMessage}
                                    boldStyle
                                    shouldFocusOnSelectRow={this.props.isGroupChat}
                                    shouldShowConfirmButton={this.props.isGroupChat}
                                    confirmButtonText={this.props.translate('newChatPage.createGroup')}
                                    onConfirmSelection={this.createGroup}
                                    placeholderText={this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                                    safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                                />
                            ) : (
                                <FullScreenLoadingIndicator />
                            )}
                        </View>
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

NewChatPage.propTypes = propTypes;
NewChatPage.defaultProps = defaultProps;

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
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(NewChatPage);
