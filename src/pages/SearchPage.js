import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';

const propTypes = {
    /* Onyx Props */

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    /** Whether we are searching for reports in the server */
    isSearchingForReports: PropTypes.bool,
};

const defaultProps = {
    betas: [],
    personalDetails: {},
    reports: {},
    isSearchingForReports: false,
};

function SearchPage({betas, personalDetails, reports, isSearchingForReports}) {
    const [searchValue, setSearchValue] = useState('');
    const [searchOptions, setSearchOptions] = useState({
        recentReports: {},
        personalDetails: {},
        userToInvite: {},
    });

    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const themeStyles = useThemeStyles();
    const isMounted = useRef(false);

    const updateOptions = useCallback(() => {
        const {
            recentReports: localRecentReports,
            personalDetails: localPersonalDetails,
            userToInvite: localUserToInvite,
        } = OptionsListUtils.getSearchOptions(reports, personalDetails, searchValue.trim(), betas);

        setSearchOptions({
            recentReports: localRecentReports,
            personalDetails: localPersonalDetails,
            userToInvite: localUserToInvite,
        });
    }, [reports, personalDetails, searchValue, betas]);

    useEffect(() => {
        Timing.start(CONST.TIMING.SEARCH_RENDER);
        Performance.markStart(CONST.TIMING.SEARCH_RENDER);
    }, []);

    useEffect(() => {
        updateOptions();
    }, [reports, personalDetails, betas, updateOptions]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        updateOptions();
        // Ignoring the rule intentionally, we want to run the code only when search Value changes to prevent additional runs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    const getSections = () => {
        const sections = [];
        let indexOffset = 0;

        if (searchOptions.recentReports.length > 0) {
            sections.push({
                data: searchOptions.recentReports,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += searchOptions.recentReports.length;
        }

        if (searchOptions.personalDetails.length > 0) {
            sections.push({
                data: searchOptions.personalDetails,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += searchOptions.recentReports.length;
        }

        if (searchOptions.userToInvite) {
            sections.push({
                data: [searchOptions.userToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sections;
    };

    const searchRendered = () => {
        Timing.end(CONST.TIMING.SEARCH_RENDER);
        Performance.markEnd(CONST.TIMING.SEARCH_RENDER);
    };

    const onChangeText = (value = '') => {
        Report.searchInServer(searchValue);
        setSearchValue(value);
    };

    /**
     * Reset the search value and redirect to the selected report
     *
     * @param {Object} option
     */
    const selectReport = (option) => {
        if (!option) {
            return;
        }
        if (option.reportID) {
            Navigation.dismissModal(option.reportID);
        } else {
            Report.navigateToAndOpenReport([option.login]);
        }
    };

    const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails);
    const headerMessage = OptionsListUtils.getHeaderMessage(
        searchOptions.recentReports.length + searchOptions.personalDetails.length !== 0,
        Boolean(searchOptions.userToInvite),
        searchValue,
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={SearchPage.displayName}
            onEntryTransitionEnd={updateOptions}
        >
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton title={translate('common.search')} />
                    <View style={[themeStyles.flex1, themeStyles.w100, themeStyles.pRelative]}>
                        <OptionsSelector
                            sections={getSections()}
                            onSelectRow={selectReport}
                            onChangeText={onChangeText}
                            headerMessage={headerMessage}
                            hideSectionHeaders
                            showTitleTooltip
                            shouldShowOptions={didScreenTransitionEnd && isOptionsDataReady}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            shouldShowReferralCTA
                            referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}
                            textInputAlert={isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''}
                            onLayout={searchRendered}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            autoFocus
                            isLoadingNewOptions={isSearchingForReports}
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

SearchPage.propTypes = propTypes;
SearchPage.defaultProps = defaultProps;
SearchPage.displayName = 'SearchPage';
export default withOnyx({
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
})(SearchPage);
