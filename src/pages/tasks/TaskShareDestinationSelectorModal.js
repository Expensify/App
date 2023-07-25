/* eslint-disable es/no-optional-chaining */
import React, {useState, useEffect, useMemo, useCallback} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../../components/OptionsSelector';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import personalDetailsPropType from '../personalDetailsPropType';
import reportPropTypes from '../reportPropTypes';
import * as Task from '../../libs/actions/Task';
import * as ReportUtils from '../../libs/ReportUtils';
import ROUTES from '../../ROUTES';

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

function TaskShareDestinationSelectorModal(props) {
    const [searchValue, setSearchValue] = useState('');
    const [headerMessage, setHeaderMessage] = useState('');
    const [filteredRecentReports, setFilteredRecentReports] = useState([]);
    const [filteredPersonalDetails, setFilteredPersonalDetails] = useState([]);
    const [filteredUserToInvite, setFilteredUserToInvite] = useState(null);

    const filteredReports = useMemo(() => {
        const reports = {};
        _.keys(props.reports).forEach((reportKey) => {
            if (!ReportUtils.isAllowedToComment(props.reports[reportKey])) {
                return;
            }
            reports[reportKey] = props.reports[reportKey];
        });
        return reports;
    }, [props.reports]);
    const updateOptions = useCallback(() => {
        const {recentReports, personalDetails, userToInvite} = OptionsListUtils.getShareDestinationOptions(
            filteredReports,
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
    }, [props, searchValue, filteredReports]);

    useEffect(() => {
        const debouncedSearch = _.debounce(updateOptions, 150);
        debouncedSearch();
        return () => {
            debouncedSearch.cancel();
        };
    }, [updateOptions]);

    const onChangeText = (newSearchTerm = '') => {
        setSearchValue(newSearchTerm);
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
            Task.setShareDestinationValue(option.reportID);
            Navigation.goBack(ROUTES.NEW_TASK);
        }
    };

    const sections = getSections();
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={props.translate('newTaskPage.shareSomewhere')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
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
                            textInputLabel={props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

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
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(TaskShareDestinationSelectorModal);
