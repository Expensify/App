import isEmpty from 'lodash/isEmpty';
import reject from 'lodash/reject';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import {useOptionsList} from '@components/OptionListContextProvider';
import {PressableWithFeedback} from '@components/Pressable';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectCircle from '@components/SelectCircle';
import SelectionList from '@components/SelectionList';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
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

const excludedGroupEmails: Array<string> = CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE);

function useOptions({isGroupChat}: NewChatPageProps) {
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<Array<ListItem & OptionData>>([]);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [newGroupDraft] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT);
    const personalData = useCurrentUserPersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const {options: listOptions, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const defaultOptions = useMemo(() => {
        const filteredOptions = OptionsListUtils.getFilteredOptions(
            listOptions.reports ?? [],
            listOptions.personalDetails ?? [],
            betas ?? [],
            '',
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
            undefined,
            undefined,
            0,
            undefined,
            true,
        );
        return filteredOptions;
    }, [betas, isGroupChat, listOptions.personalDetails, listOptions.reports, selectedOptions]);

    const options = useMemo(() => {
        const filteredOptions = OptionsListUtils.filterOptions(defaultOptions, debouncedSearchTerm, {
            selectedOptions,
            excludeLogins: isGroupChat ? excludedGroupEmails : [],
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });

        return filteredOptions;
    }, [debouncedSearchTerm, defaultOptions, isGroupChat, selectedOptions]);
    const cleanSearchTerm = useMemo(() => debouncedSearchTerm.trim().toLowerCase(), [debouncedSearchTerm]);
    const headerMessage = useMemo(() => {
        return OptionsListUtils.getHeaderMessage(
            options.personalDetails.length + options.recentReports.length !== 0,
            !!options.userToInvite,
            debouncedSearchTerm.trim(),
            selectedOptions.some((participant) => OptionsListUtils.getPersonalDetailSearchTerms(participant).join(' ').toLowerCase?.().includes(cleanSearchTerm)),
        );
    }, [cleanSearchTerm, debouncedSearchTerm, options.personalDetails.length, options.recentReports.length, options.userToInvite, selectedOptions]);

    useEffect(() => {
        if (!debouncedSearchTerm.length) {
            return;
        }

        Report.searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (!newGroupDraft?.participants) {
            return;
        }
        const newSelectedOptions: OptionData[] = [];
        newGroupDraft.participants.forEach((participant) => {
            if (participant.accountID === personalData.accountID) {
                return;
            }
            let participantOption: OptionData | undefined | null = listOptions.personalDetails.find((option) => option.accountID === participant.accountID);
            if (!participantOption) {
                participantOption = OptionsListUtils.getUserToInviteOption({
                    searchValue: participant.login,
                });
            }
            if (!participantOption) {
                return;
            }
            newSelectedOptions.push({
                ...participantOption,
                isSelected: true,
            });
        });
        setSelectedOptions(newSelectedOptions);
    }, [newGroupDraft?.participants, listOptions.personalDetails, personalData.accountID]);

    return {
        ...options,
        searchTerm,
        debouncedSearchTerm,
        setSearchTerm,
        areOptionsInitialized: areOptionsInitialized && didScreenTransitionEnd,
        selectedOptions,
        setSelectedOptions,
        headerMessage,
    };
}

function NewChatPage({isGroupChat}: NewChatPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to show offline indicator on small screen only
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const personalData = useCurrentUserPersonalDetails();
    const {insets} = useStyledSafeAreaInsets();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const selectionListRef = useRef<SelectionListHandle>(null);

    const {headerMessage, searchTerm, debouncedSearchTerm, setSearchTerm, selectedOptions, setSelectedOptions, recentReports, personalDetails, userToInvite, areOptionsInitialized} =
        useOptions({
            isGroupChat,
        });

    const [sections, firstKeyForList] = useMemo(() => {
        const sectionsList: OptionsListUtils.CategorySection[] = [];
        let firstKey = '';

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(debouncedSearchTerm, selectedOptions, recentReports, personalDetails);
        sectionsList.push(formatResults.section);

        if (!firstKey) {
            firstKey = OptionsListUtils.getFirstKeyForList(formatResults.section.data);
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: recentReports,
            shouldShow: !isEmpty(recentReports),
        });
        if (!firstKey) {
            firstKey = OptionsListUtils.getFirstKeyForList(recentReports);
        }

        sectionsList.push({
            title: translate('common.contacts'),
            data: personalDetails,
            shouldShow: !isEmpty(personalDetails),
        });
        if (!firstKey) {
            firstKey = OptionsListUtils.getFirstKeyForList(personalDetails);
        }

        if (userToInvite) {
            sectionsList.push({
                title: undefined,
                data: [userToInvite],
                shouldShow: true,
            });
            if (!firstKey) {
                firstKey = OptionsListUtils.getFirstKeyForList([userToInvite]);
            }
        }

        return [sectionsList, firstKey];
    }, [debouncedSearchTerm, selectedOptions, recentReports, personalDetails, translate, userToInvite]);

    /**
     * Creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    const createChat = useCallback(
        (option?: OptionsListUtils.Option) => {
            if (option?.isSelfDM) {
                Navigation.dismissModal(option.reportID);
                return;
            }
            let login = '';

            if (option?.login) {
                login = option.login;
            } else if (selectedOptions.length === 1) {
                login = selectedOptions.at(0)?.login ?? '';
            }
            if (!login) {
                Log.warn('Tried to create chat with empty login');
                return;
            }
            Report.navigateToAndOpenReport([login]);
        },
        [selectedOptions],
    );

    const itemRightSideComponent = useCallback(
        (item: ListItem & OptionsListUtils.Option, isFocused?: boolean) => {
            if (!!item.isSelfDM || (item.login && excludedGroupEmails.includes(item.login))) {
                return null;
            }
            /**
             * Removes a selected option from list if already selected. If not already selected add this option to the list.
             * @param  option
             */
            function toggleOption(option: ListItem & Partial<OptionData>) {
                const isOptionInList = !!option.isSelected;

                let newSelectedOptions;

                if (isOptionInList) {
                    newSelectedOptions = reject(selectedOptions, (selectedOption) => selectedOption.login === option.login);
                } else {
                    newSelectedOptions = [...selectedOptions, {...option, isSelected: true, selected: true, reportID: option.reportID ?? '-1'}];
                }

                selectionListRef?.current?.clearInputAfterSelect?.();

                setSelectedOptions(newSelectedOptions);
            }

            if (item.isSelected) {
                return (
                    <PressableWithFeedback
                        onPress={() => toggleOption(item)}
                        disabled={item.isDisabled}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={CONST.ROLE.BUTTON}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.optionSelectCircle]}
                    >
                        <SelectCircle
                            isChecked={item.isSelected}
                            selectCircleStyles={styles.ml0}
                        />
                    </PressableWithFeedback>
                );
            }
            const buttonInnerStyles = isFocused ? styles.buttonDefaultHovered : {};
            return (
                <Button
                    onPress={() => toggleOption(item)}
                    style={[styles.pl2]}
                    text={translate('newChatPage.addToGroup')}
                    innerStyles={buttonInnerStyles}
                    small
                />
            );
        },
        [selectedOptions, setSelectedOptions, styles, translate],
    );

    const createGroup = useCallback(() => {
        if (!personalData || !personalData.login || !personalData.accountID) {
            return;
        }
        const selectedParticipants: SelectedParticipant[] = selectedOptions.map((option: OptionData) => ({login: option.login ?? '', accountID: option.accountID ?? -1}));
        const logins = [...selectedParticipants, {login: personalData.login, accountID: personalData.accountID}];
        Report.setGroupDraft({participants: logins});
        Navigation.navigate(ROUTES.NEW_CHAT_CONFIRM);
    }, [selectedOptions, personalData]);

    const footerContent = useMemo(
        () => (
            <>
                <ReferralProgramCTA
                    referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT}
                    style={selectedOptions.length ? styles.mb5 : undefined}
                />

                {!!selectedOptions.length && (
                    <Button
                        success
                        large
                        text={translate('common.next')}
                        onPress={createGroup}
                        pressOnEnter
                    />
                )}
            </>
        ),
        [createGroup, selectedOptions.length, styles.mb5, translate],
    );

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom={isOffline}
            shouldShowOfflineIndicator={false}
            includePaddingTop={false}
            shouldEnablePickerAvoiding={false}
            testID={NewChatPage.displayName}
            // Disable the focus trap of this page to activate the parent focus trap in `NewChatSelectorPage`.
            focusTrapSettings={{active: false}}
        >
            <KeyboardAvoidingView
                style={styles.flex1}
                behavior="padding"
                // Offset is needed as KeyboardAvoidingView in nested inside of TabNavigator instead of wrapping whole screen.
                // This is because when wrapping whole screen the screen was freezing when changing Tabs.
                keyboardVerticalOffset={variables.contentHeaderHeight + (insets?.top ?? 0) + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding}
            >
                <SelectionList<OptionsListUtils.Option & ListItem>
                    ref={selectionListRef}
                    ListItem={UserListItem}
                    sections={areOptionsInitialized ? sections : CONST.EMPTY_ARRAY}
                    textInputValue={searchTerm}
                    textInputHint={isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''}
                    onChangeText={setSearchTerm}
                    textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                    headerMessage={headerMessage}
                    onSelectRow={createChat}
                    shouldSingleExecuteRowSelect
                    onConfirm={(e, option) => (selectedOptions.length > 0 ? createGroup() : createChat(option))}
                    rightHandSideComponent={itemRightSideComponent}
                    footerContent={footerContent}
                    showLoadingPlaceholder={!areOptionsInitialized}
                    shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                    isLoadingNewOptions={!!isSearchingForReports}
                    initiallyFocusedOptionKey={firstKeyForList}
                    shouldTextInputInterceptSwipe
                />
                {isSmallScreenWidth && (
                    <>
                        <OfflineIndicator />
                        <ImportedStateIndicator />
                    </>
                )}
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

NewChatPage.displayName = 'NewChatPage';

export default NewChatPage;
