/* eslint-disable es/no-optional-chaining */
import React, {useState, useEffect, useCallback} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../../components/OptionsSelector';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import Timing from '../../libs/actions/Timing';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import personalDetailsPropType from '../personalDetailsPropType';
import reportPropTypes from '../reportPropTypes';
import Performance from '../../libs/Performance';
import * as TaskUtils from '../../libs/actions/Task';

const propTypes = {
    /* Onyx Props */

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: personalDetailsPropType,

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    personalDetails: {},
    reports: {},
};

const TaskShareDestinationSelectorModal = (props) => {
    const [searchValue, setSearchValue] = useState('');
    const [headerMessage, setHeaderMessage] = useState('');
    const [filteredRecentReports, setFilteredRecentReports] = useState([]);
    const [filteredPersonalDetails, setFilteredPersonalDetails] = useState([]);
    const [filteredUserToInvite, setFilteredUserToInvite] = useState(null);

    useEffect(() => {
        const results = OptionsListUtils.getShareDestinationOptions(props.reports, props.personalDetails, props.betas, '', [], CONST.EXPENSIFY_EMAILS, true);

        setFilteredUserToInvite(results.userToInvite);
        setFilteredRecentReports(results.recentReports);
        setFilteredPersonalDetails(results.personalDetails);
    }, [props]);

    const updateOptions = useCallback(() => {
        const {recentReports, personalDetails, userToInvite} = OptionsListUtils.getShareDestinationOptions(
            props.reports,
            props.personalDetails,
            props.betas,
            searchValue.trim(),
            [],
            CONST.EXPENSIFY_EMAILS,
            true,
        );

        setHeaderMessage(OptionsListUtils.getHeaderMessage(recentReports?.length + personalDetails?.length !== 0, Boolean(userToInvite), searchValue));

        setFilteredUserToInvite(userToInvite);
        setFilteredRecentReports(recentReports);
        setFilteredPersonalDetails(personalDetails);
    }, [props, searchValue]);

    useEffect(() => {
        Timing.start(CONST.TIMING.SEARCH_RENDER);
        Performance.markStart(CONST.TIMING.SEARCH_RENDER);

        updateOptions();

        return () => {
            Timing.end(CONST.TIMING.SEARCH_RENDER);
            Performance.markEnd(CONST.TIMING.SEARCH_RENDER);
        };
    }, [updateOptions]);

    const onChangeText = (newSearchTerm = '') => {
        setSearchValue(newSearchTerm);
        updateOptions();
    };

    const getSections = () => {
        const sections = [];
        let indexOffset = 0;

        if (filteredRecentReports?.length > 0) {
            sections.push({
                data: filteredRecentReports,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += filteredRecentReports?.length;
        }

        if (filteredPersonalDetails?.length > 0) {
            sections.push({
                data: filteredPersonalDetails,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += filteredRecentReports?.length;
        }

        if (filteredUserToInvite) {
            sections.push({
                data: [filteredUserToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sections;
    };

    const selectReport = (option) => {
        if (!option) {
            return;
        }

        if (option.reportID) {
            // Clear out the state value, set the assignee and navigate back to the NewTaskPage
            setSearchValue('');
            TaskUtils.setShareDestinationValue(option.reportID);
            Navigation.goBack();
        }
    };

    const sections = getSections();
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithCloseButton
                        title={props.translate('newTaskPage.shareSomewhere')}
                        onCloseButtonPress={() => Navigation.goBack()}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <OptionsSelector
                            sections={sections}
                            value={searchValue}
                            onSelectRow={selectReport}
                            onChangeText={onChangeText}
                            headerMessage={headerMessage}
                            hideSection
                            Headers
                            showTitleTooltip
                            shouldShowOptions={didScreenTransitionEnd}
                            placeholderText={props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                            onLayout={() => {
                                Timing.end(CONST.TIMING.SEARCH_RENDER);
                                Performance.markEnd(CONST.TIMING.SEARCH_RENDER);
                            }}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
};

TaskShareDestinationSelectorModal.displayName = 'TaskShareDestinationSelectorModal';
TaskShareDestinationSelectorModal.propTypes = propTypes;
TaskShareDestinationSelectorModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
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
)(TaskShareDestinationSelectorModal);
