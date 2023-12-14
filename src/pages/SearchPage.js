import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {Info} from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import * as ReportUtils from '@libs/ReportUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
    const [isScreenTransitionEnd, setIsScreenTransitionEnd] = useState(false);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const themeStyles = useThemeStyles();
    const theme = useTheme();

    const offlineMessage = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('', 75);

    useEffect(() => {
        Timing.start(CONST.TIMING.SEARCH_RENDER);
        Performance.markStart(CONST.TIMING.SEARCH_RENDER);
    }, []);

    const onChangeText = (text = '') => {
        Report.searchInServer(text);
        setSearchValue(text);
    };

    const {
        recentReports,
        personalDetails: localPersonalDetails,
        userToInvite,
        headerMessage,
    } = useMemo(() => {
        if (!isScreenTransitionEnd) {
            return {
                recentReports: {},
                personalDetails: {},
                userToInvite: {},
                headerMessage: '',
            };
        }
        const options = OptionsListUtils.getSearchOptions(reports, personalDetails, debouncedSearchValue.trim(), betas);
        const header = OptionsListUtils.getHeaderMessage(options.recentReports.length + options.personalDetails.length !== 0, Boolean(options.userToInvite), debouncedSearchValue);
        return {...options, headerMessage: header};
    }, [debouncedSearchValue, reports, personalDetails, betas, isScreenTransitionEnd]);

    const sections = useMemo(() => {
        const newSections = [];
        let indexOffset = 0;

        if (recentReports.length > 0) {
            newSections.push({
                data: recentReports,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += recentReports.length;
        }

        if (localPersonalDetails.length > 0) {
            newSections.push({
                data: localPersonalDetails,
                shouldShow: true,
                indexOffset,
            });
            indexOffset += recentReports.length;
        }

        if (userToInvite) {
            newSections.push({
                data: [userToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return newSections;
    }, [localPersonalDetails, recentReports, userToInvite]);

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

    const searchRendered = () => {
        Timing.end(CONST.TIMING.SEARCH_RENDER);
        Performance.markEnd(CONST.TIMING.SEARCH_RENDER);
    };

    const handleScreenTransitionEnd = () => {
        setIsScreenTransitionEnd(true);
    };

    const isOptionsDataReady = useMemo(() => ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails), [personalDetails]);

    const footerRender = (
        <View style={[themeStyles.pb5, themeStyles.flexShrink0]}>
            <PressableWithoutFeedback
                onPress={() => {
                    Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND));
                }}
                style={[
                    themeStyles.p5,
                    themeStyles.w100,
                    themeStyles.br2,
                    themeStyles.highlightBG,
                    themeStyles.flexRow,
                    themeStyles.justifyContentBetween,
                    themeStyles.alignItemsCenter,
                    {gap: 10},
                ]}
                accessibilityLabel="referral"
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Text>
                    {translate(`referralProgram.${CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}.buttonText1`)}
                    <Text
                        color={theme.success}
                        style={themeStyles.textStrong}
                    >
                        {translate(`referralProgram.${CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}.buttonText2`)}
                    </Text>
                </Text>
                <Icon
                    src={Info}
                    height={20}
                    width={20}
                />
            </PressableWithoutFeedback>
        </View>
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={SearchPage.displayName}
            onEntryTransitionEnd={handleScreenTransitionEnd}
        >
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton title={translate('common.search')} />
                    <View style={[themeStyles.flex1, themeStyles.w100, safeAreaPaddingBottomStyle]}>
                        <SelectionList
                            sections={didScreenTransitionEnd && isOptionsDataReady ? sections : []}
                            textInputValue={searchValue}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            textInputHint={offlineMessage}
                            onChangeText={onChangeText}
                            headerMessage={headerMessage}
                            onLayout={searchRendered}
                            autoFocus
                            onSelectRow={selectReport}
                            showLoadingPlaceholder={!didScreenTransitionEnd || !isOptionsDataReady}
                            footerContent={footerRender}
                        />
                        {/* <OptionsSelector */}
                        {/*     sections={sections} */}
                        {/*     value={searchValue} */}
                        {/*     onSelectRow={selectReport} */}
                        {/*     onChangeText={onChangeText} */}
                        {/*     headerMessage={headerMessage} */}
                        {/*     hideSectionHeaders */}
                        {/*     showTitleTooltip */}
                        {/*     shouldShowOptions={didScreenTransitionEnd && isOptionsDataReady} */}
                        {/*     textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')} */}
                        {/*     textInputAlert={network.isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''} */}
                        {/*     shouldShowReferralCTA */}
                        {/*     referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND} */}
                        {/*     onLayout={searchRendered} */}
                        {/*     safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle} */}
                        {/*     autoFocus */}
                        {/*     isLoadingNewOptions={isSearchingForReports} */}
                        {/* /> */}
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
