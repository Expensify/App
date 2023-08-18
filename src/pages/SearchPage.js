import _ from 'underscore';
import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../components/OptionsSelector';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import * as ReportUtils from '../libs/ReportUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import * as Report from '../libs/actions/Report';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import ScreenWrapper from '../components/ScreenWrapper';
import Timing from '../libs/actions/Timing';
import CONST from '../CONST';
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';
import Performance from '../libs/Performance';
import useLocalize from '../hooks/useLocalize';

const propTypes = {
    /* Onyx Props */

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: personalDetailsPropType,

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),
};

const defaultProps = {
    betas: [],
    personalDetails: {},
    reports: {},
};

function SearchPage(props) {
    // Data for initialization (runs only on the first render)
    const {
        recentReports: initialRecentReports,
        personalDetails: initialPersonalDetails,
        userToInvite: initialUserToInvite,
        // Ignoring the rule because in this case we need the data only initially
        // eslint-disable-next-line react-hooks/exhaustive-deps
    } = useMemo(() => OptionsListUtils.getSearchOptions(props.reports, props.personalDetails, '', props.betas), []);

    const [searchValue, setSearchValue] = useState('');
    const [searchOptions, setSearchOptions] = useState({
        recentReports: initialRecentReports,
        personalDetails: initialPersonalDetails,
        userToInvite: initialUserToInvite,
    });

    const {translate} = useLocalize();

    const updateOptions = useCallback(() => {
        const {
            recentReports: localRecentReports,
            personalDetails: localPersonalDetails,
            userToInvite: localUserToInvite,
        } = OptionsListUtils.getSearchOptions(props.reports, props.personalDetails, searchValue.trim(), props.betas);

        setSearchOptions({
            recentReports: localRecentReports,
            personalDetails: localPersonalDetails,
            userToInvite: localUserToInvite,
        });
    }, [props.reports, props.personalDetails, searchValue, props.betas]);

    const debouncedUpdateOptions = useMemo(() => _.debounce(updateOptions, 75), [updateOptions]);

    useEffect(() => {
        Timing.start(CONST.TIMING.SEARCH_RENDER);
        Performance.markStart(CONST.TIMING.SEARCH_RENDER);
    }, []);

    useEffect(() => {
        debouncedUpdateOptions();
    }, [searchValue, debouncedUpdateOptions]);

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
            setSearchValue('');
            Navigation.dismissModal(option.reportID);
        } else {
            Report.navigateToAndOpenReport([option.login]);
        }
    };

    const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(props.personalDetails);
    const headerMessage = OptionsListUtils.getHeaderMessage(
        searchOptions.recentReports.length + searchOptions.personalDetails.length !== 0,
        Boolean(searchOptions.userToInvite),
        searchValue,
    );
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton title={translate('common.search')} />
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <OptionsSelector
                            sections={getSections()}
                            value={searchValue}
                            onSelectRow={selectReport}
                            onChangeText={onChangeText}
                            headerMessage={headerMessage}
                            hideSectionHeaders
                            showTitleTooltip
                            shouldShowOptions={didScreenTransitionEnd && isOptionsDataReady}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            onLayout={searchRendered}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
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
})(SearchPage);
