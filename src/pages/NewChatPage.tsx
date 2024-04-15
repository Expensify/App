import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import {useOptionsList} from '@components/OptionListContextProvider';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSearchTermAndSearch from '@hooks/useSearchTermAndSearch';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import doInteractionTask from '@libs/DoInteractionTask';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SelectedParticipant} from '@src/types/onyx/NewGroupChatDraft';

type NewChatPageProps = {
    isGroupChat?: boolean;
};

const excludedGroupEmails = CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE);

function NewChatPage({isGroupChat}: NewChatPageProps) {
    const [dismissedReferralBanners] = useOnyx(ONYXKEYS.NVP_DISMISSED_REFERRAL_BANNERS);
    const [newGroupDraft] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});

    const {translate} = useLocalize();

    const styles = useThemeStyles();

    const personalData = useCurrentUserPersonalDetails();

    const getGroupParticipants = () => {
        if (!newGroupDraft?.participants) {
            return [];
        }
        const selectedParticipants = newGroupDraft.participants.filter((participant) => participant.accountID !== personalData.accountID);
        const newSelectedOptions = selectedParticipants.map((participant): OptionData => {
            const baseOption = OptionsListUtils.getParticipantsOption({accountID: participant.accountID, login: participant.login, reportID: ''}, personalDetails);
            return {...baseOption, reportID: baseOption.reportID ?? ''};
        });
        return newSelectedOptions;
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRecentReports, setFilteredRecentReports] = useState<OptionData[]>([]);
    const [filteredPersonalDetails, setFilteredPersonalDetails] = useState<OptionData[]>([]);
    const [filteredUserToInvite, setFilteredUserToInvite] = useState<OptionData | null>();
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>(getGroupParticipants);
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const maxParticipantsReached = selectedOptions.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
    const setSearchTermAndSearchInServer = useSearchTermAndSearch(setSearchTerm, maxParticipantsReached);

    const headerMessage = OptionsListUtils.getHeaderMessage(
        filteredPersonalDetails.length + filteredRecentReports.length !== 0,
        Boolean(filteredUserToInvite),
        searchTerm.trim(),
        maxParticipantsReached,
        selectedOptions.some((participant) => participant?.searchText?.toLowerCase().includes(searchTerm.trim().toLowerCase())),
    );

    const sections = useMemo((): OptionsListUtils.CategorySection[] => {
        const sectionsList: OptionsListUtils.CategorySection[] = [];

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(searchTerm, selectedOptions, filteredRecentReports, filteredPersonalDetails, maxParticipantsReached);
        sectionsList.push(formatResults.section);

        if (maxParticipantsReached) {
            return sectionsList;
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: filteredRecentReports,
            shouldShow: filteredRecentReports.length > 0,
        });

        sectionsList.push({
            title: translate('common.contacts'),
            data: filteredPersonalDetails,
            shouldShow: filteredPersonalDetails.length > 0,
        });

        if (filteredUserToInvite) {
            sectionsList.push({
                title: undefined,
                data: [filteredUserToInvite],
                shouldShow: true,
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
            options.reports ?? [],
            options.personalDetails ?? [],
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
        let login = '';

        if (option.login) {
            login = option.login;
        } else if (selectedOptions.length === 1) {
            login = selectedOptions[0].login ?? '';
        }

        if (!login) {
            Log.warn('Tried to create chat with empty login');
            return;
        }

        Report.navigateToAndOpenReport([login]);
    };
    /**
     * Navigates to create group confirm page
     */
    const navigateToConfirmPage = () => {
        if (!personalData || !personalData.login || !personalData.accountID) {
            return;
        }
        const selectedParticipants: SelectedParticipant[] = selectedOptions.map((option: OptionData) => ({login: option.login ?? '', accountID: option.accountID ?? -1}));
        const logins = [...selectedParticipants, {login: personalData.login, accountID: personalData.accountID}];
        Report.setGroupDraft({participants: logins});
        Navigation.navigate(ROUTES.NEW_CHAT_CONFIRM);
    };

    const updateOptions = useCallback(() => {
        const {
            recentReports,
            personalDetails: newChatPersonalDetails,
            userToInvite,
        } = OptionsListUtils.getFilteredOptions(
            options.reports ?? [],
            options.personalDetails ?? [],
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
    }, [options, searchTerm]);

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
        setSelectedOptions(getGroupParticipants());
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Overwrite participants only if the draft changes
    }, [newGroupDraft?.participants]);

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
                            shouldShowOptions={areOptionsInitialized}
                            shouldShowConfirmButton
                            shouldShowReferralCTA={!dismissedReferralBanners?.[CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]}
                            referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT}
                            confirmButtonText={selectedOptions.length > 1 ? translate('common.next') : translate('newChatPage.createChat')}
                            textInputAlert={isOffline ? [`${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}`, {isTranslated: true}] : ''}
                            onConfirmSelection={selectedOptions.length > 1 ? navigateToConfirmPage : createChat}
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

NewChatPage.displayName = 'NewChatPage';

export default NewChatPage;
