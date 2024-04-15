import isEmpty from 'lodash/isEmpty';
import reject from 'lodash/reject';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import {useOptionsList} from '@components/OptionListContextProvider';
import {PressableWithFeedback} from '@components/Pressable';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import SelectCircle from '@components/SelectCircle';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
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

const excludedGroupEmails = CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE);

function useOptions({isGroupChat}: NewChatPageProps) {
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<Array<ListItem & OptionData>>([]);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [newGroupDraft] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT);
    const personalData = useCurrentUserPersonalDetails();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const {options: listOptions, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const options = useMemo(() => {
        const filteredOptions = OptionsListUtils.getFilteredOptions(
            listOptions.reports ?? [],
            listOptions.personalDetails ?? [],
            betas ?? [],
            debouncedSearchTerm,
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
        const maxParticipantsReached = selectedOptions.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;

        const headerMessage = OptionsListUtils.getHeaderMessage(
            filteredOptions.personalDetails.length + filteredOptions.recentReports.length !== 0,
            Boolean(filteredOptions.userToInvite),
            debouncedSearchTerm.trim(),
            maxParticipantsReached,
            selectedOptions.some((participant) => participant?.searchText?.toLowerCase?.().includes(debouncedSearchTerm.trim().toLowerCase())),
        );
        return {...filteredOptions, headerMessage, maxParticipantsReached};
    }, [betas, debouncedSearchTerm, isGroupChat, listOptions.personalDetails, listOptions.reports, selectedOptions]);

    useEffect(() => {
        if (!debouncedSearchTerm.length || options.maxParticipantsReached) {
            return;
        }

        Report.searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm, options.maxParticipantsReached]);

    useEffect(() => {
        if (!newGroupDraft?.participants) {
            return;
        }
        const selectedParticipants = newGroupDraft.participants.filter((participant) => participant.accountID !== personalData.accountID);
        const newSelectedOptions = selectedParticipants.map((participant): OptionData => {
            const baseOption = OptionsListUtils.getParticipantsOption({accountID: participant.accountID, login: participant.login, reportID: ''}, personalDetails);
            return {...baseOption, reportID: baseOption.reportID ?? '', isSelected: true};
        });
        setSelectedOptions(newSelectedOptions);
    }, [newGroupDraft, personalData, personalDetails]);

    return {...options, searchTerm, debouncedSearchTerm, setSearchTerm, areOptionsInitialized: areOptionsInitialized && didScreenTransitionEnd, selectedOptions, setSelectedOptions};
}

function NewChatPage({isGroupChat}: NewChatPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const personalData = useCurrentUserPersonalDetails();
    const {insets} = useStyledSafeAreaInsets();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});

    const {
        headerMessage,
        maxParticipantsReached,
        searchTerm,
        debouncedSearchTerm,
        setSearchTerm,
        selectedOptions,
        setSelectedOptions,
        recentReports,
        personalDetails,
        userToInvite,
        areOptionsInitialized,
    } = useOptions({
        isGroupChat,
    });

    const [sections, firstKeyForList] = useMemo(() => {
        const sectionsList: OptionsListUtils.CategorySection[] = [];
        let firstKey = '';

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(debouncedSearchTerm, selectedOptions, recentReports, personalDetails, maxParticipantsReached);
        sectionsList.push(formatResults.section);

        if (!firstKey) {
            firstKey = OptionsListUtils.getFirstKeyForList(formatResults.section.data);
        }

        if (maxParticipantsReached) {
            return [sectionsList, firstKey];
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
    }, [debouncedSearchTerm, selectedOptions, recentReports, personalDetails, maxParticipantsReached, translate, userToInvite]);

    /**
     * Creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    const createChat = useCallback(
        (option?: OptionsListUtils.Option) => {
            let login = '';

            if (option?.login) {
                login = option.login;
            } else if (selectedOptions.length === 1) {
                login = selectedOptions[0].login ?? '';
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
        (item: ListItem & OptionsListUtils.Option) => {
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
                    newSelectedOptions = [...selectedOptions, {...option, isSelected: true, selected: true, reportID: option.reportID ?? ''}];
                }

                setSelectedOptions(newSelectedOptions);
            }

            if (item.isSelected) {
                return (
                    <PressableWithFeedback
                        onPress={() => toggleOption(item)}
                        disabled={item.isDisabled}
                        role={CONST.ACCESSIBILITY_ROLE.CHECKBOX}
                        accessibilityLabel={CONST.ACCESSIBILITY_ROLE.CHECKBOX}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.ml3]}
                    >
                        <SelectCircle isChecked={item.isSelected} />
                    </PressableWithFeedback>
                );
            }

            return (
                <Button
                    onPress={() => toggleOption(item)}
                    style={[styles.pl2]}
                    text={translate('newChatPage.addToGroup')}
                    small
                />
            );
        },
        [selectedOptions, setSelectedOptions, styles, translate],
    );

    const footerContent = useMemo(() => {
        /**
         * Creates a new group chat with all the selected options and the current user,
         * or navigates to the existing chat if one with those participants already exists.
         */
        const createGroup = () => {
            if (selectedOptions.length === 1) {
                createChat();
            }
            if (!personalData || !personalData.login || !personalData.accountID) {
                return;
            }
            const selectedParticipants: SelectedParticipant[] = selectedOptions.map((option: OptionData) => ({login: option.login ?? '', accountID: option.accountID ?? -1}));
            const logins = [...selectedParticipants, {login: personalData.login, accountID: personalData.accountID}];
            Report.setGroupDraft({participants: logins});
            Navigation.navigate(ROUTES.NEW_CHAT_CONFIRM);
        };

        return (
            <>
                <ReferralProgramCTA
                    referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT}
                    style={selectedOptions.length ? styles.mb5 : undefined}
                />

                {!!selectedOptions.length && (
                    <Button
                        success
                        text={selectedOptions.length > 1 ? translate('common.next') : translate('newChatPage.createChat')}
                        onPress={createGroup}
                        pressOnEnter
                    />
                )}
            </>
        );
    }, [createChat, personalData, selectedOptions, styles.mb5, translate]);

    return (
        <View
            style={styles.flex1}
            testID={NewChatPage.displayName}
        >
            <KeyboardAvoidingView
                style={styles.flex1}
                behavior="padding"
                // Offset is needed as KeyboardAvoidingView in nested inside of TabNavigator instead of wrapping whole screen.
                // This is because when wrapping whole screen the screen was freezing when changing Tabs.
                keyboardVerticalOffset={variables.contentHeaderHeight + (insets?.top ?? 0) + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding}
            >
                <SelectionList<OptionsListUtils.Option & ListItem>
                    ListItem={UserListItem}
                    sections={areOptionsInitialized ? sections : CONST.EMPTY_ARRAY}
                    textInputValue={searchTerm}
                    textInputHint={isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''}
                    onChangeText={setSearchTerm}
                    textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                    headerMessage={headerMessage}
                    onSelectRow={createChat}
                    rightHandSideComponent={itemRightSideComponent}
                    footerContent={footerContent}
                    showLoadingPlaceholder={!areOptionsInitialized}
                    shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                    isLoadingNewOptions={!!isSearchingForReports}
                    initiallyFocusedOptionKey={firstKeyForList}
                />
                {isSmallScreenWidth && <OfflineIndicator />}
            </KeyboardAvoidingView>
        </View>
    );
}

NewChatPage.displayName = 'NewChatPage';

export default NewChatPage;
