import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useNetwork from '@hooks/useNetwork';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import compose from '@libs/compose';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import * as ReportUtils from '@libs/ReportUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    /** Whether we are searching for reports in the server */
    isSearchingForReports: PropTypes.bool,
};

const defaultProps = {
    betas: [],
    personalDetails: {},
    reports: {},
    isSearchingForReports: false,
};

const excludedGroupEmails = _.without(CONST.EXPENSIFY_EMAILS, CONST.EMAIL.CONCIERGE);

function NewChatPage({betas, isGroupChat, personalDetails, reports, translate, isSearchingForReports}) {
    const styles = useThemeStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRecentReports, setFilteredRecentReports] = useState([]);
    const [filteredPersonalDetails, setFilteredPersonalDetails] = useState([]);
    const [filteredUserToInvite, setFilteredUserToInvite] = useState();
    const [selectedOptions, setSelectedOptions] = useState([]);
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();

    const maxParticipantsReached = selectedOptions.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
    const headerMessage = OptionsListUtils.getHeaderMessage(
        filteredPersonalDetails.length + filteredRecentReports.length !== 0,
        Boolean(filteredUserToInvite),
        searchTerm.trim(),
        maxParticipantsReached,
        _.some(selectedOptions, (participant) => participant.searchText.toLowerCase().includes(searchTerm.trim().toLowerCase())),
    );
    const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails);

    const sections = useMemo(() => {
        const sectionsList = [];
        let indexOffset = 0;

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(searchTerm, selectedOptions, filteredRecentReports, filteredPersonalDetails, {}, false, indexOffset);
        sectionsList.push(formatResults.section);
        indexOffset = formatResults.newIndexOffset;

        if (maxParticipantsReached) {
            return sectionsList;
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: filteredRecentReports,
            shouldShow: !_.isEmpty(filteredRecentReports),
            indexOffset,
        });
        indexOffset += filteredRecentReports.length;

        sectionsList.push({
            title: translate('common.contacts'),
            data: filteredPersonalDetails,
            shouldShow: !_.isEmpty(filteredPersonalDetails),
            indexOffset,
        });
        indexOffset += filteredPersonalDetails.length;

        if (filteredUserToInvite) {
            sectionsList.push({
                title: undefined,
                data: [filteredUserToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sectionsList;
    }, [translate, filteredPersonalDetails, filteredRecentReports, filteredUserToInvite, maxParticipantsReached, selectedOptions, searchTerm]);

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    function toggleOption(option) {
        const isOptionInList = _.some(selectedOptions, (selectedOption) => selectedOption.login === option.login);

        let newSelectedOptions;

        if (isOptionInList) {
            newSelectedOptions = _.reject(selectedOptions, (selectedOption) => selectedOption.login === option.login);
        } else {
            newSelectedOptions = [...selectedOptions, option];
        }

        const {
            recentReports,
            personalDetails: newChatPersonalDetails,
            userToInvite,
        } = OptionsListUtils.getFilteredOptions(
            reports,
            personalDetails,
            betas,
            searchTerm,
            newSelectedOptions,
            isGroupChat ? excludedGroupEmails : [],
            false,
            true,
            false,
            {},
            [],
            false,
            {},
            [],
            true,
            true,
        );

        setSelectedOptions(newSelectedOptions);
        setFilteredRecentReports(recentReports);
        setFilteredPersonalDetails(newChatPersonalDetails);
        setFilteredUserToInvite(userToInvite);
    }

    /**
     * Creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     *
     * @param {Object} option
     */
    function createChat(option) {
        Report.navigateToAndOpenReport([option.login]);
    }

    /**
     * Creates a new group chat with all the selected options and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    const createGroup = () => {
        const logins = _.pluck(selectedOptions, 'login');
        if (logins.length < 1) {
            return;
        }
        Report.navigateToAndOpenReport(logins);
    };

    useEffect(() => {
        const {
            recentReports,
            personalDetails: newChatPersonalDetails,
            userToInvite,
        } = OptionsListUtils.getFilteredOptions(
            reports,
            personalDetails,
            betas,
            searchTerm,
            selectedOptions,
            isGroupChat ? excludedGroupEmails : [],
            false,
            true,
            false,
            {},
            [],
            false,
            {},
            [],
            true,
            true,
        );
        setFilteredRecentReports(recentReports);
        setFilteredPersonalDetails(newChatPersonalDetails);
        setFilteredUserToInvite(userToInvite);
        // props.betas is not added as dependency since it doesn't change during the component lifecycle
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports, personalDetails, searchTerm]);

    // When search term updates we will fetch any reports
    const setSearchTermAndSearchInServer = useCallback((text = '') => {
        if (text.length) {
            Report.searchInServer(text);
        }
        setSearchTerm(text);
    }, []);

    const {inputCallbackRef} = useAutoFocusInput();

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom={isOffline}
            shouldShowOfflineIndicator={false}
            includePaddingTop={false}
            shouldEnableMaxHeight
            testID={NewChatPage.displayName}
        >
            {({safeAreaPaddingBottomStyle, insets}) => (
                <KeyboardAvoidingView
                    style={{height: '100%'}}
                    behavior="padding"
                    // Offset is needed as KeyboardAvoidingView in nested inside of TabNavigator instead of wrapping whole screen.
                    // This is because when wrapping whole screen the screen was freezing when changing Tabs.
                    keyboardVerticalOffset={
                        variables.contentHeaderHeight + insets.top + (Permissions.canUsePolicyRooms(betas) ? variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding : 0)
                    }
                >
                    <View style={[styles.flex1, styles.w100, styles.pRelative, selectedOptions.length > 0 ? safeAreaPaddingBottomStyle : {}]}>
                        <OptionsSelector
                            ref={inputCallbackRef}
                            canSelectMultipleOptions
                            shouldShowMultipleOptionSelectorAsButton
                            multipleOptionSelectorButtonText={translate('newChatPage.addToGroup')}
                            onAddToSelection={(option) => toggleOption(option)}
                            sections={sections}
                            selectedOptions={selectedOptions}
                            value={searchTerm}
                            onSelectRow={(option) => createChat(option)}
                            onChangeText={setSearchTermAndSearchInServer}
                            headerMessage={headerMessage}
                            boldStyle
                            shouldPreventDefaultFocusOnSelectRow={!Browser.isMobile()}
                            shouldShowOptions={isOptionsDataReady}
                            shouldShowConfirmButton
                            shouldShowReferralCTA
                            referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT}
                            confirmButtonText={selectedOptions.length > 1 ? translate('newChatPage.createGroup') : translate('newChatPage.createChat')}
                            textInputAlert={isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''}
                            onConfirmSelection={createGroup}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            isLoadingNewOptions={isSearchingForReports}
                            autoFocus={false}
                        />
                    </View>
                    {isSmallScreenWidth && <OfflineIndicator />}
                </KeyboardAvoidingView>
            )}
        </ScreenWrapper>
    );
}

NewChatPage.propTypes = propTypes;
NewChatPage.defaultProps = defaultProps;
NewChatPage.displayName = 'NewChatPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isSearchingForReports: {
            key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
            initWithStoredValues: false,
        },
    }),
)(NewChatPage);
