import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
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

    /** Window Dimensions Props */
    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    /** Network info */
    network: networkPropTypes,

    /** Whether we are searching for reports in the server */
    isSearchingForReports: PropTypes.bool,
    ...withThemeStylesPropTypes,
};

const defaultProps = {
    betas: [],
    personalDetails: {},
    reports: {},
    network: {},
    isSearchingForReports: false,
};

class SearchPage extends Component {
    constructor(props) {
        super(props);

        Timing.start(CONST.TIMING.SEARCH_RENDER);
        Performance.markStart(CONST.TIMING.SEARCH_RENDER);

        this.searchRendered = this.searchRendered.bind(this);
        this.selectReport = this.selectReport.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
        this.updateOptions = this.updateOptions.bind(this);
        this.debouncedUpdateOptions = _.debounce(this.updateOptions.bind(this), 75);
        this.state = {
            searchValue: '',
            recentReports: {},
            personalDetails: {},
            userToInvite: {},
        };
    }

    componentDidUpdate(prevProps) {
        if (_.isEqual(prevProps.reports, this.props.reports) && _.isEqual(prevProps.personalDetails, this.props.personalDetails)) {
            return;
        }
        this.updateOptions();
    }

    onChangeText(searchValue = '') {
        if (searchValue.length) {
            Report.searchInServer(searchValue);
        }

        this.setState({searchValue}, this.debouncedUpdateOptions);
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    getSections() {
        const sections = [];
        let indexOffset = 0;

        if (this.state.recentReports.length > 0) {
            sections.push({
                data: this.state.recentReports,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += this.state.recentReports.length;
        }

        if (this.state.personalDetails.length > 0) {
            sections.push({
                data: this.state.personalDetails,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += this.state.recentReports.length;
        }

        if (this.state.userToInvite) {
            sections.push({
                data: [this.state.userToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sections;
    }

    searchRendered() {
        Timing.end(CONST.TIMING.SEARCH_RENDER);
        Performance.markEnd(CONST.TIMING.SEARCH_RENDER);
    }

    updateOptions() {
        const {recentReports, personalDetails, userToInvite} = OptionsListUtils.getSearchOptions(
            this.props.reports,
            this.props.personalDetails,
            this.state.searchValue.trim(),
            this.props.betas,
        );
        this.setState({
            userToInvite,
            recentReports,
            personalDetails,
        });
    }

    /**
     * Reset the search value and redirect to the selected report
     *
     * @param {Object} option
     */
    selectReport(option) {
        if (!option) {
            return;
        }

        if (option.reportID) {
            this.setState(
                {
                    searchValue: '',
                },
                () => {
                    Navigation.dismissModal(option.reportID);
                },
            );
        } else {
            Report.navigateToAndOpenReport([option.login]);
        }
    }

    render() {
        const sections = this.getSections();
        const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(this.props.personalDetails);
        const headerMessage = OptionsListUtils.getHeaderMessage(
            this.state.recentReports.length + this.state.personalDetails.length !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchValue,
        );

        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={SearchPage.displayName}
                onEntryTransitionEnd={this.updateOptions}
            >
                {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                    <>
                        <HeaderWithBackButton title={this.props.translate('common.search')} />
                        <View style={[this.props.themeStyles.flex1, this.props.themeStyles.w100, this.props.themeStyles.pRelative]}>
                            <OptionsSelector
                                sections={sections}
                                value={this.state.searchValue}
                                onSelectRow={this.selectReport}
                                onChangeText={this.onChangeText}
                                headerMessage={headerMessage}
                                hideSectionHeaders
                                showTitleTooltip
                                shouldShowOptions={didScreenTransitionEnd && isOptionsDataReady}
                                textInputLabel={this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                                textInputAlert={
                                    this.props.network.isOffline ? `${this.props.translate('common.youAppearToBeOffline')} ${this.props.translate('search.resultsAreLimited')}` : ''
                                }
                                shouldShowReferralCTA
                                referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}
                                onLayout={this.searchRendered}
                                safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                                autoFocus
                                isLoadingNewOptions={this.props.isSearchingForReports}
                            />
                        </View>
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

SearchPage.propTypes = propTypes;
SearchPage.defaultProps = defaultProps;
SearchPage.displayName = 'SearchPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withNetwork(),
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
    withThemeStyles,
)(SearchPage);
