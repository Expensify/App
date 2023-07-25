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
import compose from '../libs/compose';
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

function SearchPage({betas = [], personalDetails = {}, reports= {}}) {
    //Data for initialization (runs only on the first render)
    const {recentReports: initialRecentReports, personalDetails: initialPersonalDetails, userToInvite: initialUserToInvite} = useMemo(() => OptionsListUtils.getSearchOptions(reports, personalDetails, '', betas), []);

    const [searchValue, setSearchValue] = useState('')
    const [activeRecentReports, setActiveRecentReports] = useState(initialRecentReports)
    const [activePersonalDetails, setActivePersonalDetails] = useState(initialPersonalDetails)
    const [activeUserToInvite, setActiveUserToInvite] = useState(initialUserToInvite)

    const {translate} = useLocalize();

    const updateOptions = useCallback(() => {
        const {recentReports: localRecentReports, personalDetails: localPersonalDetails, userToInvite: localUserToInvite} = OptionsListUtils.getSearchOptions(
            reports,
            personalDetails,
            searchValue.trim(),
            betas,
        );

        setActiveUserToInvite(localUserToInvite)
        setActiveRecentReports(localRecentReports)
        setActivePersonalDetails(localPersonalDetails)
    }, [reports, personalDetails, searchValue, betas])

    const debouncedUpdateOptions = useCallback(() => _.debounce(updateOptions, 75), [updateOptions]);

    useEffect(() => {
        Timing.start(CONST.TIMING.SEARCH_RENDER);
        Performance.markStart(CONST.TIMING.SEARCH_RENDER);
    },[])

    useEffect(() => {
        debouncedUpdateOptions()
    }, [searchValue, debouncedUpdateOptions])

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    const getSections = () => {
        const sections = [];
        let indexOffset = 0;

        if (activeRecentReports.length > 0) {
            sections.push({
                data: activeRecentReports,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += activeRecentReports.length;
        }

        if (activePersonalDetails.length > 0) {
            sections.push({
                data: activePersonalDetails,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += activeRecentReports.length;
        }

        if (activeUserToInvite) {
            sections.push({
                data: [activeUserToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sections;
    }

    const searchRendered = () => {
        Timing.end(CONST.TIMING.SEARCH_RENDER);
        Performance.markEnd(CONST.TIMING.SEARCH_RENDER);
    }

    const onChangeText = (value = '') => {
        setSearchValue(value)
    }

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
            setSearchValue('')
            Navigation.dismissModal(option.reportID);
        } else {
            Report.navigateToAndOpenReport([option.login]);
        }
    }

    const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails);
    const headerMessage = OptionsListUtils.getHeaderMessage(
        activeRecentReports.length + activePersonalDetails.length !== 0,
        Boolean(activeUserToInvite),
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
    )
}

SearchPage.propTypes = propTypes;
SearchPage.displayName = 'SearchPage';
export default compose(
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
)(SearchPage);
