import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchTermAndSearch from '@hooks/useSearchTermAndSearch';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import doInteractionTask from '@libs/DoInteractionTask';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {DismissedReferralBanners} from '@src/types/onyx/Account';

type NewChatPageWithOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<OnyxTypes.Report>;

    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;

    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** An object that holds data about which referral banners have been dismissed */
    dismissedReferralBanners: DismissedReferralBanners;

    /** Whether we are searching for reports in the server */
    isSearchingForReports: OnyxEntry<boolean>;
};

type NewChatPageProps = NewChatPageWithOnyxProps & {
    isGroupChat: boolean;
};

const excludedGroupEmails = CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE);

function NewChatPage({betas, isGroupChat, personalDetails, reports, isSearchingForReports, dismissedReferralBanners}: NewChatPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRecentReports, setFilteredRecentReports] = useState<ReportUtils.OptionData[]>([]);
    const [filteredPersonalDetails, setFilteredPersonalDetails] = useState<ReportUtils.OptionData[]>([]);
    const [filteredUserToInvite, setFilteredUserToInvite] = useState<ReportUtils.OptionData | null>();
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([]);
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);

    const maxParticipantsReached = selectedOptions.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
    const setSearchTermAndSearchInServer = useSearchTermAndSearch(setSearchTerm, maxParticipantsReached);

    const headerMessage = OptionsListUtils.getHeaderMessage(
        filteredPersonalDetails.length + filteredRecentReports.length !== 0,
        Boolean(filteredUserToInvite),
        searchTerm.trim(),
        maxParticipantsReached,
        selectedOptions.some((participant) => participant?.searchText?.toLowerCase().includes(searchTerm.trim().toLowerCase())),
    );

    const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails);

    const sections = useMemo((): OptionsListUtils.CategorySection[] => {
        const sectionsList: OptionsListUtils.CategorySection[] = [];
        let indexOffset = 0;

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(searchTerm, selectedOptions, filteredRecentReports, filteredPersonalDetails, maxParticipantsReached, indexOffset);
        sectionsList.push(formatResults.section);

        indexOffset = formatResults.newIndexOffset;

        if (maxParticipantsReached) {
            return sectionsList;
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: filteredRecentReports,
            shouldShow: filteredRecentReports.length > 0,
            indexOffset,
        });
        indexOffset += filteredRecentReports.length;

        sectionsList.push({
            title: translate('common.contacts'),
            data: filteredPersonalDetails,
            shouldShow: filteredPersonalDetails.length > 0,
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
     */
    const toggleOption = (option: OptionData) => {
        const isOptionInList = selectedOptions.some((selectedOption) => selectedOption.login === option.login);

        let newSelectedOptions;

        if (isOptionInList) {
            newSelectedOptions = selectedOptions.filter((selectedOption) => selectedOption.login !== option.login);
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
            betas ?? [],
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
        );

        setSelectedOptions(newSelectedOptions);
        setFilteredRecentReports(recentReports);
        setFilteredPersonalDetails(newChatPersonalDetails);
        setFilteredUserToInvite(userToInvite);
    };

    /**
     * Creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    const createChat = (option: OptionData) => {
        if (!option.login) {
            return;
        }
        Report.navigateToAndOpenReport([option.login]);
    };

    /**
     * Creates a new group chat with all the selected options and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    const createGroup = () => {
        const logins = selectedOptions.map((option) => option.login).filter((login): login is string => typeof login === 'string');

        if (logins.length < 1) {
            return;
        }

        Report.navigateToAndOpenReport(logins);
    };

    const updateOptions = useCallback(() => {
        const {
            recentReports,
            personalDetails: newChatPersonalDetails,
            userToInvite,
        } = OptionsListUtils.getFilteredOptions(
            reports,
            personalDetails,
            betas ?? [],
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
        );
        setFilteredRecentReports(recentReports);
        setFilteredPersonalDetails(newChatPersonalDetails);
        setFilteredUserToInvite(userToInvite);
        // props.betas is not added as dependency since it doesn't change during the component lifecycle
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports, personalDetails, searchTerm]);

    useEffect(() => {
        const interactionTask = doInteractionTask(() => {
            setDidScreenTransitionEnd(true);
        });

        return () => {
            if (!interactionTask) {
                return;
            }

            interactionTask.cancel();
        };
    }, []);

    useEffect(() => {
        if (!didScreenTransitionEnd) {
            return;
        }
        updateOptions();
    }, [didScreenTransitionEnd, updateOptions]);

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
                    keyboardVerticalOffset={variables.contentHeaderHeight + (insets?.top ?? 0) + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding}
                >
                    <View style={[styles.flex1, styles.w100, styles.pRelative, selectedOptions.length > 0 ? safeAreaPaddingBottomStyle : {}]}>
                        <OptionsSelector
                            ref={inputCallbackRef}
                            // @ts-expect-error TODO: Remove this once OptionsSelector (https://github.com/Expensify/App/issues/25125) is migrated to TypeScript.
                            canSelectMultipleOptions
                            shouldShowMultipleOptionSelectorAsButton
                            multipleOptionSelectorButtonText={translate('newChatPage.addToGroup')}
                            onAddToSelection={toggleOption}
                            sections={sections}
                            selectedOptions={selectedOptions}
                            onSelectRow={createChat}
                            onChangeText={setSearchTermAndSearchInServer}
                            headerMessage={headerMessage}
                            boldStyle
                            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                            shouldShowOptions={isOptionsDataReady && didScreenTransitionEnd}
                            shouldShowConfirmButton
                            shouldShowReferralCTA={!dismissedReferralBanners[CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]}
                            referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT}
                            confirmButtonText={selectedOptions.length > 1 ? translate('newChatPage.createGroup') : translate('newChatPage.createChat')}
                            textInputAlert={isOffline ? [`${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}`, {isTranslated: true}] : ''}
                            onConfirmSelection={createGroup}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            isLoadingNewOptions={isSearchingForReports}
                            autoFocus={false}
                        />
                    </View>
                    {shouldUseNarrowLayout && <OfflineIndicator />}
                </KeyboardAvoidingView>
            )}
        </ScreenWrapper>
    );
}

NewChatPage.displayName = 'NewChatPage';

export default withOnyx<NewChatPageProps, NewChatPageWithOnyxProps>({
    dismissedReferralBanners: {
        key: ONYXKEYS.ACCOUNT,
        selector: (data) => data?.dismissedReferralBanners ?? {},
    },
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
})(NewChatPage);
