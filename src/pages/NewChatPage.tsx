import {useFocusEffect} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import reject from 'lodash/reject';
import type {Ref} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {PressableWithFeedback} from '@components/Pressable';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectCircle from '@components/SelectCircle';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem, SelectionListHandle} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useContactImport from '@hooks/useContactImport';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useFilteredOptions from '@hooks/useFilteredOptions';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useSingleExecution from '@hooks/useSingleExecution';
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
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';
import type {SelectedParticipant} from '@src/types/onyx/NewGroupChatDraft';
import KeyboardUtils from '@src/utils/keyboard';

const excludedGroupEmails = new Set<string>(CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE));

type SelectedOption = ListItem &
    Omit<OptionData, 'reportID'> & {
        reportID?: string;
    };

function getSelectedOptionKey(option: Partial<OptionData>) {
    return option.keyForList?.toString() ?? option.login ?? option.reportID ?? option.accountID?.toString() ?? option.text ?? '';
}

function useOptions(reportAttributesDerived: ReportAttributesDerivedValue['reports'] | undefined) {
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [newGroupDraft] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const personalData = useCurrentUserPersonalDetails();
    const currentUserAccountID = personalData.accountID;
    const currentUserEmail = personalData.email ?? '';
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const {contacts} = useContactImport();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const allPersonalDetails = usePersonalDetails();

    const {
        options: listOptions,
        isLoading,
        loadMore,
        hasMore,
    } = useFilteredOptions({
        maxRecentReports: 500,
        enabled: didScreenTransitionEnd,
        includeP2P: true,
        batchSize: 100,
        enablePagination: true,
        searchTerm: debouncedSearchTerm,
        betas,
    });

    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const reports = listOptions?.reports ?? [];
    const personalDetails = listOptions?.personalDetails ?? [];

    const defaultOptions = getValidOptions(
        {
            reports,
            personalDetails: personalDetails.concat(contacts),
        },
        allPolicies,
        draftComments,
        nvpDismissedProductTraining,
        loginList,
        currentUserAccountID,
        currentUserEmail,
        {
            betas: betas ?? [],
            includeSelfDM: true,
            shouldAlwaysIncludeDM: true,
            personalDetails: allPersonalDetails,
            countryCode,
            reportAttributesDerived,
        },
    );

    const areOptionsInitialized = !isLoading;

    const options = filterAndOrderOptions(defaultOptions, debouncedSearchTerm, countryCode, loginList, currentUserEmail, currentUserAccountID, allPersonalDetails, {
        selectedOptions,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
    });

    const cleanSearchTerm = debouncedSearchTerm.trim().toLowerCase();

    const headerMessage = getHeaderMessage(
        options.personalDetails.length + options.recentReports.length !== 0,
        !!options.userToInvite,
        debouncedSearchTerm.trim(),
        countryCode,
        selectedOptions.some((participant) => getPersonalDetailSearchTerms(participant, currentUserAccountID).join(' ').toLowerCase?.().includes(cleanSearchTerm)),
    );

    useFocusEffect(() => {
        focusTimeoutRef.current = setTimeout(() => {
            setDidScreenTransitionEnd(true);
        }, CONST.ANIMATED_TRANSITION);

        return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
    });

    useEffect(() => {
        if (!debouncedSearchTerm.length) {
            return;
        }

        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const participants = newGroupDraft?.participants;

    const draftSelectedOptions: OptionData[] | null =
        participants && personalDetails.length
            ? participants.reduce<OptionData[]>((result, participant) => {
                  if (participant.accountID === personalData.accountID) {
                      return result;
                  }
                  const participantOption: OptionData | undefined | null =
                      personalDetails.find((option) => option.accountID === participant.accountID) ??
                      getUserToInviteOption({
                          searchValue: participant?.login,
                          personalDetails: allPersonalDetails,
                          loginList,
                          currentUserEmail: personalData.email ?? '',
                          currentUserAccountID: personalData.accountID,
                      });
                  if (participantOption) {
                      result.push({
                          ...participantOption,
                          isSelected: true,
                      });
                  }
                  return result;
              }, [])
            : null;

    useEffect(() => {
        if (!draftSelectedOptions) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedOptions((prevSelectedOptions) => {
            if (
                prevSelectedOptions.length === draftSelectedOptions.length &&
                prevSelectedOptions.every((prevOption, index) => {
                    const nextOption = draftSelectedOptions.at(index);
                    if (!nextOption) {
                        return false;
                    }
                    return prevOption.accountID === nextOption.accountID && prevOption.login === nextOption.login;
                })
            ) {
                return prevSelectedOptions;
            }

            return draftSelectedOptions;
        });
    }, [draftSelectedOptions, setSelectedOptions]);

    const handleEndReached = () => {
        if (!hasMore || !areOptionsInitialized) {
            return;
        }
        loadMore();
    };

    return {
        ...options,
        searchTerm,
        debouncedSearchTerm,
        setSearchTerm,
        areOptionsInitialized,
        selectedOptions,
        setSelectedOptions,
        headerMessage,
        handleEndReached,
    };
}

type NewChatPageRef = {
    focus?: () => void;
};

type NewChatPageProps = {
    /** Reference to the outer element */
    ref?: Ref<NewChatPageRef>;
};
function NewChatPage({ref}: NewChatPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to show offline indicator on small screen only
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const styles = useThemeStyles();
    const personalData = useCurrentUserPersonalDetails();
    const currentUserAccountID = personalData.accountID;
    const {top} = useSafeAreaInsets();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [reportAttributesDerivedFull] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    const reportAttributesDerived = reportAttributesDerivedFull?.reports;
    const selectionListRef = useRef<SelectionListHandle | null>(null);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    const allPersonalDetails = usePersonalDetails();
    const {singleExecution} = useSingleExecution();

    useImperativeHandle(ref, () => ({
        focus: selectionListRef.current?.focusTextInput,
    }));

    const {
        headerMessage,
        searchTerm,
        debouncedSearchTerm,
        handleEndReached,
        setSearchTerm,
        selectedOptions,
        setSelectedOptions,
        recentReports,
        personalDetails,
        userToInvite,
        areOptionsInitialized,
    } = useOptions(reportAttributesDerived);

    useFocusEffect(
        useCallback(() => {
            setHasUserInteracted(false);
        }, []),
    );

    const initialSelectedOptions = useInitialSelectionRef(selectedOptions, {resetOnFocus: true, shouldSyncSelection: !hasUserInteracted});

    const selectedOptionKeySet = useMemo(() => new Set(selectedOptions.map(getSelectedOptionKey).filter(Boolean)), [selectedOptions]);
    const initialSelectedKeySet = useMemo(() => new Set(initialSelectedOptions.map(getSelectedOptionKey).filter(Boolean)), [initialSelectedOptions]);
    const totalOptionsCount = recentReports.length + personalDetails.length + (userToInvite ? 1 : 0);
    const shouldReorderInitialSelection = debouncedSearchTerm.trim().length === 0 && initialSelectedKeySet.size > 0 && totalOptionsCount > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;

    const sections: Section[] = [];
    let firstKeyForList = '';

    let selectedSectionData: Section['data'] = [];

    if (shouldReorderInitialSelection) {
        selectedSectionData = initialSelectedOptions.map((option) => ({
            ...option,
            isSelected: selectedOptionKeySet.has(getSelectedOptionKey(option)),
        }));
    } else if (debouncedSearchTerm.trim()) {
        selectedSectionData = formatSectionsFromSearchTerm(
            debouncedSearchTerm,
            selectedOptions as OptionData[],
            recentReports,
            personalDetails,
            privateIsArchivedMap,
            currentUserAccountID,
            allPersonalDetails,
            undefined,
            undefined,
            reportAttributesDerived,
        ).section.data;
    }

    if (selectedSectionData.length > 0) {
        sections.push({title: undefined, data: selectedSectionData, shouldShow: true});
        if (!firstKeyForList) {
            firstKeyForList = getFirstKeyForList(selectedSectionData);
        }
    }

    const visibleRecentReports = recentReports
        .filter((option) => !shouldReorderInitialSelection || !initialSelectedKeySet.has(getSelectedOptionKey(option)))
        .filter((option) => !selectedOptions.length || !option.isSelfDM)
        .map((option) => ({
            ...option,
            isSelected: selectedOptionKeySet.has(getSelectedOptionKey(option)),
        }));

    sections.push({
        title: translate('common.recents'),
        data: visibleRecentReports,
        shouldShow: !isEmpty(visibleRecentReports),
    });
    if (!firstKeyForList) {
        firstKeyForList = getFirstKeyForList(visibleRecentReports);
    }

    const visiblePersonalDetails = personalDetails
        .filter((option) => !shouldReorderInitialSelection || !initialSelectedKeySet.has(getSelectedOptionKey(option)))
        .map((option) => ({
            ...option,
            isSelected: selectedOptionKeySet.has(getSelectedOptionKey(option)),
        }));

    sections.push({
        title: translate('common.contacts'),
        data: visiblePersonalDetails,
        shouldShow: !isEmpty(visiblePersonalDetails),
    });
    if (!firstKeyForList) {
        firstKeyForList = getFirstKeyForList(visiblePersonalDetails);
    }

    const visibleUserToInvite =
        userToInvite && (!shouldReorderInitialSelection || !initialSelectedKeySet.has(getSelectedOptionKey(userToInvite)))
            ? {
                  ...userToInvite,
                  isSelected: selectedOptionKeySet.has(getSelectedOptionKey(userToInvite)),
              }
            : undefined;

    if (visibleUserToInvite) {
        sections.push({
            title: undefined,
            data: [visibleUserToInvite],
            shouldShow: true,
        });
        if (!firstKeyForList) {
            firstKeyForList = getFirstKeyForList([visibleUserToInvite]);
        }
    }

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     */
    const toggleOption = (option: ListItem & Partial<OptionData>) => {
        setHasUserInteracted(true);
        const isOptionInList = !!option.isSelected;

        let newSelectedOptions: SelectedOption[];

        if (isOptionInList) {
            newSelectedOptions = reject(selectedOptions, (selectedOption) => selectedOption.login === option.login);
        } else {
            newSelectedOptions = [...selectedOptions, {...option, isSelected: true, selected: true, reportID: option.reportID, keyForList: `${option.keyForList ?? option.reportID}`}];
        }

        selectionListRef?.current?.clearInputAfterSelect?.();
        if (!canUseTouchScreen()) {
            selectionListRef.current?.focusTextInput();
        }
        setSelectedOptions(newSelectedOptions);

        if (personalData?.login && personalData?.accountID) {
            const participants: SelectedParticipant[] = [
                ...newSelectedOptions.map((selectedOption) => ({
                    login: selectedOption.login,
                    accountID: selectedOption.accountID ?? CONST.DEFAULT_NUMBER_ID,
                })),
                {
                    login: personalData.login,
                    accountID: personalData.accountID,
                },
            ];
            setGroupDraft({participants});
        }
    };

    /**
     * If there are selected options already then it will toggle the option otherwise
     * creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    const selectOption = (option?: Option) => {
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
            if (option?.login && excludedGroupEmails.has(option.login)) {
                return;
            }
            toggleOption(option);
            return;
        }

        if (option?.reportID) {
            Navigation.dismissModal({
                callback: () => {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(option?.reportID));
                },
            });
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
        KeyboardUtils.dismiss().then(() => {
            singleExecution(() => navigateToAndOpenReport([login], currentUserAccountID, introSelected))();
        });
    };

    const itemRightSideComponent = (item: ListItem & Option, itemIsFocused?: boolean) => {
        if (!!item.isSelfDM || (item.login && excludedGroupEmails.has(item.login)) || !item.login) {
            return null;
        }

        if (item.isSelected) {
            return (
                <PressableWithFeedback
                    sentryLabel={CONST.SENTRY_LABEL.NEW_CHAT.SELECT_PARTICIPANT}
                    onPress={() => toggleOption(item)}
                    disabled={item.isDisabled}
                    role={CONST.ROLE.CHECKBOX}
                    accessibilityLabel={item.text ? translate('selectionList.userSelected', item.text) : ''}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.optionSelectCircle]}
                >
                    <SelectCircle
                        isChecked={item.isSelected}
                        selectCircleStyles={styles.ml0}
                    />
                </PressableWithFeedback>
            );
        }
        const buttonInnerStyles = itemIsFocused ? styles.buttonDefaultHovered : {};
        return (
            <Button
                onPress={() => toggleOption(item)}
                style={[styles.pl2]}
                text={translate('newChatPage.addToGroup')}
                accessibilityLabel={item.text ? translate('newChatPage.addUserToGroup', item.text) : ''}
                innerStyles={buttonInnerStyles}
                small
            />
        );
    };

    const createGroup = () => {
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
    };
    const {isDismissed} = useDismissedReferralBanners({referralContentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT});

    const footerContent = (!isDismissed || selectedOptions.length > 0) && (
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
            testID="NewChatPage"
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
                shouldShowLoadingPlaceholder={!areOptionsInitialized}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                isLoadingNewOptions={!!isSearchingForReports}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.75}
                initiallyFocusedOptionKey={firstKeyForList}
                shouldTextInputInterceptSwipe
                addBottomSafeAreaPadding
                textInputAutoFocus={false}
                shouldScrollToTopOnSelect={false}
            />
        </ScreenWrapper>
    );
}

export default NewChatPage;
