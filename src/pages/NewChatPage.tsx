import isEmpty from 'lodash/isEmpty';
import reject from 'lodash/reject';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
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
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToAndOpenReport, searchInServer, setGroupDraft} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {Option, Section} from '@libs/OptionsListUtils';
import {
    filterAndOrderOptions,
    formatSectionsFromSearchTerm,
    getFirstKeyForList,
    getHeaderMessage,
    getPersonalDetailSearchTerms,
    getUserToInviteOption,
    getValidOptions,
} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SelectedParticipant} from '@src/types/onyx/NewGroupChatDraft';
import KeyboardUtils from '@src/utils/keyboard';

const excludedGroupEmails: string[] = CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE);

type SelectedOption = ListItem &
    Omit<OptionData, 'reportID'> & {
        reportID?: string;
    };

function useOptions() {
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [newGroupDraft] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, {canBeMissing: true});
    const personalData = useCurrentUserPersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const {options: listOptions, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const defaultOptions = useMemo(() => {
        const filteredOptions = getValidOptions(
            {
                reports: listOptions.reports ?? [],
                personalDetails: listOptions.personalDetails ?? [],
            },
            {
                betas: betas ?? [],
                selectedOptions,
                includeSelfDM: true,
            },
        );
        return filteredOptions;
    }, [betas, listOptions.personalDetails, listOptions.reports, selectedOptions]);

    const options = useMemo(() => {
        const filteredOptions = filterAndOrderOptions(defaultOptions, debouncedSearchTerm, {
            selectedOptions,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });

        return filteredOptions;
    }, [debouncedSearchTerm, defaultOptions, selectedOptions]);
    const cleanSearchTerm = useMemo(() => debouncedSearchTerm.trim().toLowerCase(), [debouncedSearchTerm]);
    const headerMessage = useMemo(() => {
        return getHeaderMessage(
            options.personalDetails.length + options.recentReports.length !== 0,
            !!options.userToInvite,
            debouncedSearchTerm.trim(),
            selectedOptions.some((participant) => getPersonalDetailSearchTerms(participant).join(' ').toLowerCase?.().includes(cleanSearchTerm)),
        );
    }, [cleanSearchTerm, debouncedSearchTerm, options.personalDetails.length, options.recentReports.length, options.userToInvite, selectedOptions]);

    useEffect(() => {
        if (!debouncedSearchTerm.length) {
            return;
        }

        searchInServer(debouncedSearchTerm);
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
                participantOption = getUserToInviteOption({
                    searchValue: participant?.login,
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

type NewChatPageRef = {
    focus?: () => void;
};

function NewChatPage(_: unknown, ref: React.Ref<NewChatPageRef>) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to show offline indicator on small screen only
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const styles = useThemeStyles();
    const personalData = useCurrentUserPersonalDetails();
    const {top} = useSafeAreaInsets();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const selectionListRef = useRef<SelectionListHandle | null>(null);

    useImperativeHandle(ref, () => ({
        focus: selectionListRef.current?.focusTextInput,
    }));

    const {headerMessage, searchTerm, debouncedSearchTerm, setSearchTerm, selectedOptions, setSelectedOptions, recentReports, personalDetails, userToInvite, areOptionsInitialized} =
        useOptions();

    const [sections, firstKeyForList] = useMemo(() => {
        const sectionsList: Section[] = [];
        let firstKey = '';

        const formatResults = formatSectionsFromSearchTerm(debouncedSearchTerm, selectedOptions as OptionData[], recentReports, personalDetails);
        sectionsList.push(formatResults.section);

        if (!firstKey) {
            firstKey = getFirstKeyForList(formatResults.section.data);
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: selectedOptions.length ? recentReports.filter((option) => !option.isSelfDM) : recentReports,
            shouldShow: !isEmpty(recentReports),
        });
        if (!firstKey) {
            firstKey = getFirstKeyForList(recentReports);
        }

        sectionsList.push({
            title: translate('common.contacts'),
            data: personalDetails,
            shouldShow: !isEmpty(personalDetails),
        });
        if (!firstKey) {
            firstKey = getFirstKeyForList(personalDetails);
        }

        if (userToInvite) {
            sectionsList.push({
                title: undefined,
                data: [userToInvite],
                shouldShow: true,
            });
            if (!firstKey) {
                firstKey = getFirstKeyForList([userToInvite]);
            }
        }

        return [sectionsList, firstKey];
    }, [debouncedSearchTerm, selectedOptions, recentReports, personalDetails, translate, userToInvite]);

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     */
    const toggleOption = useCallback(
        (option: ListItem & Partial<OptionData>) => {
            const isOptionInList = !!option.isSelected;

            let newSelectedOptions: SelectedOption[];

            if (isOptionInList) {
                newSelectedOptions = reject(selectedOptions, (selectedOption) => selectedOption.login === option.login);
            } else {
                newSelectedOptions = [...selectedOptions, {...option, isSelected: true, selected: true, reportID: option.reportID}];
                selectionListRef?.current?.scrollToIndex(0, true);
            }

            selectionListRef?.current?.clearInputAfterSelect?.();
            if (!canUseTouchScreen()) {
                selectionListRef.current?.focusTextInput();
            }
            setSelectedOptions(newSelectedOptions);
        },
        [selectedOptions, setSelectedOptions],
    );

    /**
     * If there are selected options already then it will toggle the option otherwise
     * creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    const selectOption = useCallback(
        (option?: Option) => {
            if (option?.isSelfDM) {
                if (!option.reportID) {
                    Navigation.dismissModal();
                    return;
                }
                Navigation.dismissModalWithReport({reportID: option.reportID});
                return;
            }
            if (selectedOptions.length && option) {
                // Prevent excluded emails from being added to groups
                if (option?.login && excludedGroupEmails.includes(option.login)) {
                    return;
                }
                toggleOption(option);
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
            KeyboardUtils.dismiss().then(() => navigateToAndOpenReport([login]));
        },
        [selectedOptions, toggleOption],
    );

    const itemRightSideComponent = useCallback(
        (item: ListItem & Option, isFocused?: boolean) => {
            if (!!item.isSelfDM || (item.login && excludedGroupEmails.includes(item.login))) {
                return null;
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
        [toggleOption, styles.alignItemsCenter, styles.buttonDefaultHovered, styles.flexRow, styles.ml0, styles.ml5, styles.optionSelectCircle, styles.pl2, translate],
    );

    const createGroup = useCallback(() => {
        if (!personalData || !personalData.login || !personalData.accountID) {
            return;
        }
        const selectedParticipants: SelectedParticipant[] = selectedOptions.map((option) => ({
            login: option?.login,
            accountID: option.accountID ?? CONST.DEFAULT_NUMBER_ID,
        }));
        const logins = [...selectedParticipants, {login: personalData.login, accountID: personalData.accountID}];
        setGroupDraft({participants: logins});
        Keyboard.dismiss();
        Navigation.navigate(ROUTES.NEW_CHAT_CONFIRM);
    }, [selectedOptions, personalData]);
    const {isDismissed} = useDismissedReferralBanners({referralContentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT});

    const footerContent = useMemo(
        () =>
            (!isDismissed || selectedOptions.length > 0) && (
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
        [createGroup, selectedOptions.length, styles.mb5, translate, isDismissed],
    );

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            includePaddingTop={false}
            shouldEnablePickerAvoiding={false}
            disableOfflineIndicatorSafeAreaPadding
            shouldShowOfflineIndicator={false}
            keyboardVerticalOffset={variables.contentHeaderHeight + top + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding}
            // Disable the focus trap of this page to activate the parent focus trap in `NewChatSelectorPage`.
            focusTrapSettings={{active: false}}
            testID={NewChatPage.displayName}
        >
            <SelectionList<Option & ListItem>
                ref={selectionListRef}
                ListItem={UserListItem}
                sections={areOptionsInitialized ? sections : CONST.EMPTY_ARRAY}
                textInputValue={searchTerm}
                textInputHint={isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''}
                onChangeText={setSearchTerm}
                textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                headerMessage={headerMessage}
                onSelectRow={selectOption}
                shouldSingleExecuteRowSelect
                onConfirm={(e, option) => (selectedOptions.length > 0 ? createGroup() : selectOption(option))}
                rightHandSideComponent={itemRightSideComponent}
                footerContent={footerContent}
                showLoadingPlaceholder={!areOptionsInitialized}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                isLoadingNewOptions={!!isSearchingForReports}
                initiallyFocusedOptionKey={firstKeyForList}
                shouldTextInputInterceptSwipe
                addBottomSafeAreaPadding
                textInputAutoFocus={false}
            />
        </ScreenWrapper>
    );
}

NewChatPage.displayName = 'NewChatPage';

export default forwardRef(NewChatPage);
