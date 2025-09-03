import {useFocusEffect} from '@react-navigation/native';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import Button from '@components/Button';
import {usePersonalDetailsOptionsList} from '@components/PersonalDetailsOptionListContextProvider';
import {PressableWithFeedback} from '@components/Pressable';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectCircle from '@components/SelectCircle';
import SelectionList from '@components/SelectionList';
import type {SelectionListHandle} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useContactImport from '@hooks/useContactImport';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToAndOpenReport, searchInServer, setGroupDraft} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import memoize from '@libs/memoize';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import {filterOption, getHeaderMessage, getUserToInviteOption, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SelectedParticipant} from '@src/types/onyx/NewGroupChatDraft';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import KeyboardUtils from '@src/utils/keyboard';

const excludedGroupEmails: string[] = CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE);

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'NewChatPage.getValidOptions'});

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};

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

    const {singleExecution} = useSingleExecution();

    useImperativeHandle(ref, () => ({
        focus: selectionListRef.current?.focusTextInput,
    }));

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
    const [extraOptions, setExtraOptions] = useState<OptionData[]>([]);
    const [newGroupDraft, newGroupDraftMetadata] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, {canBeMissing: true});
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const firstRenderRef = useRef(true);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const {contacts} = useContactImport();
    const {options, currentOption, areOptionsInitialized} = usePersonalDetailsOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const isLoading = isLoadingOnyxValue(newGroupDraftMetadata);

    const extendedOptions = useMemo(() => {
        return options.concat(contacts);
    }, [options, contacts]);

    const loginToAccountIDMap = useMemo(() => {
        const map: Record<string, number> = {};
        for (const option of extraOptions) {
            const login = option.login;
            if (login) {
                map[login] = option.accountID;
            }
        }
        for (const option of extendedOptions) {
            const login = option.login;
            if (login) {
                map[login] = option.accountID;
            }
        }
        return map;
    }, [extraOptions, extendedOptions]);

    const transformedOptions = useMemo(
        () =>
            extendedOptions.map((option) => ({
                ...option,
                isSelected: selectedLogins.has(option.login ?? ''),
            })),
        [extendedOptions, selectedLogins],
    );

    const filteredCurrentUserOption = useMemo(() => {
        return filterOption(currentOption, debouncedSearchTerm);
    }, [currentOption, debouncedSearchTerm]);

    const optionsList = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return memoizedGetValidOptions(transformedOptions, personalData.login ?? '', {
            extraOptions,
            includeRecentReports: true,
            searchString: debouncedSearchTerm,
            includeCurrentUser: false,
            includeUserToInvite: true,
        });
    }, [areOptionsInitialized, personalData.login, debouncedSearchTerm, extraOptions, transformedOptions]);

    const sections = useMemo(() => {
        const sectionsArr = [];

        if (!areOptionsInitialized) {
            return CONST.EMPTY_ARRAY;
        }

        if (optionsList.userToInvite) {
            sectionsArr.push({
                title: undefined,
                data: [optionsList.userToInvite],
                shouldShow: true,
            });
        } else {
            if (filteredCurrentUserOption?.reportID && selectedLogins.size === 0) {
                sectionsArr.push({
                    title: translate('workspace.invoices.paymentMethods.personal'),
                    data: [{...filteredCurrentUserOption, text: `${filteredCurrentUserOption.text} (${translate('common.you').toLowerCase()})`}],
                    shouldShow: true,
                });
            }
            if (optionsList.selectedOptions.length > 0) {
                sectionsArr.push({
                    title: undefined,
                    data: optionsList.selectedOptions,
                    shouldShow: true,
                });
            }
            if (optionsList.recentOptions.length > 0) {
                sectionsArr.push({
                    title: translate('common.recents'),
                    data: optionsList.recentOptions,
                    shouldShow: true,
                });
            }
            if (optionsList.personalDetails.length > 0) {
                sectionsArr.push({
                    title: translate('common.contacts'),
                    data: optionsList.personalDetails,
                    shouldShow: true,
                });
            }
        }
        return sectionsArr;
    }, [
        areOptionsInitialized,
        optionsList.userToInvite,
        optionsList.selectedOptions,
        optionsList.recentOptions,
        optionsList.personalDetails,
        filteredCurrentUserOption,
        selectedLogins.size,
        translate,
    ]);

    const cleanSearchTerm = useMemo(() => debouncedSearchTerm.trim().toLowerCase(), [debouncedSearchTerm]);
    const headerMessage = useMemo(() => {
        if (sections.length > 0) {
            return '';
        }
        return getHeaderMessage(translate, cleanSearchTerm);
    }, [cleanSearchTerm, sections.length, translate]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                setDidScreenTransitionEnd(true);
            }, CONST.ANIMATED_TRANSITION);

            return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
        }, []),
    );

    useEffect(() => {
        if (!debouncedSearchTerm.length) {
            return;
        }

        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (isLoading || !areOptionsInitialized || !firstRenderRef.current || !newGroupDraft?.participants) {
            return;
        }
        firstRenderRef.current = false;
        const validSelectedLogins = newGroupDraft.participants
            .filter((participant) => !!participant.login && participant.login !== personalData.login)
            .map((participant) => participant.login ?? '');
        const existingSelectedLoginsSet = new Set(validSelectedLogins);
        if (existingSelectedLoginsSet.size === 0) {
            return;
        }
        const existingLogins = new Set(extendedOptions.map((option) => option.login ?? ''));
        const newUserLogins = existingSelectedLoginsSet.difference(existingLogins);
        if (newUserLogins.size === 0) {
            setSelectedLogins(existingSelectedLoginsSet);
            return;
        }
        const extraLogins: OptionData[] = [];
        for (const newLogin of newUserLogins) {
            const userToInvite = getUserToInviteOption({searchValue: newLogin});
            if (userToInvite) {
                extraLogins.push({
                    ...userToInvite,
                    isSelected: true,
                });
            }
        }
        setExtraOptions(extraLogins);
        setSelectedLogins(existingSelectedLoginsSet);
    }, [areOptionsInitialized, extendedOptions, isLoading, newGroupDraft?.participants, personalData.login]);

    const existingLogins = useMemo(() => new Set(extendedOptions.map((option) => option.login ?? '')), [extendedOptions]);

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     */
    const toggleOption = useCallback(
        (option: OptionData) => {
            const isSelected = option.isSelected;

            if (isSelected) {
                // If the option is selected, remove it from the selected logins
                const isInExtraOption = extraOptions.some((extraOption) => extraOption.login === option.login);
                if (isInExtraOption) {
                    setExtraOptions((prev) => prev.filter((extraOption) => extraOption.login !== option.login));
                }
                setSelectedLogins((prev) => new Set([...prev].filter((login) => login !== option.login)));
            } else {
                setSelectedLogins((prev) => new Set([...prev, option.login ?? '']));
                if (!existingLogins.has(option.login ?? '')) {
                    setExtraOptions((prev) => [...prev, {...option, isSelected: true}]);
                }
            }
        },
        [existingLogins, extraOptions],
    );

    /**
     * If there are selected options already then it will toggle the option otherwise
     * creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    const selectOption = useCallback(
        (option: OptionData | undefined) => {
            if (selectedLogins.size && option) {
                // Prevent excluded emails from being added to groups
                if (option.login && excludedGroupEmails.includes(option.login)) {
                    return;
                }
                toggleOption(option);
                return;
            }
            if (option?.reportID) {
                Navigation.dismissModalWithReport({reportID: option.reportID});
                return;
            }

            let login = '';

            if (option?.login) {
                login = option.login;
            } else if (selectedLogins.size === 1) {
                login = Array.from(selectedLogins).at(0) ?? '';
            }
            if (!login) {
                Log.warn('Tried to create chat with empty login');
                return;
            }
            KeyboardUtils.dismiss().then(() => {
                singleExecution(() => navigateToAndOpenReport([login]))();
            });
        },
        [selectedLogins, toggleOption, singleExecution],
    );

    const itemRightSideComponent = useCallback(
        (item: OptionData, isFocused?: boolean) => {
            if (item.accountID === personalData.accountID || (item.login && excludedGroupEmails.includes(item.login))) {
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
        [
            personalData.accountID,
            styles.buttonDefaultHovered,
            styles.pl2,
            styles.flexRow,
            styles.alignItemsCenter,
            styles.ml5,
            styles.optionSelectCircle,
            styles.ml0,
            translate,
            toggleOption,
        ],
    );

    const createGroup = useCallback(() => {
        if (!personalData || !personalData.login || !personalData.accountID) {
            return;
        }
        const selectedParticipants: SelectedParticipant[] = [];
        for (const login of selectedLogins) {
            const accountID = loginToAccountIDMap[login] ?? CONST.DEFAULT_NUMBER_ID;
            selectedParticipants.push({login, accountID});
        }
        const logins = [...selectedParticipants, {login: personalData.login, accountID: personalData.accountID}];
        setGroupDraft({participants: logins});
        Keyboard.dismiss();
        Navigation.navigate(ROUTES.NEW_CHAT_CONFIRM);
    }, [personalData, selectedLogins, loginToAccountIDMap]);

    const {isDismissed} = useDismissedReferralBanners({referralContentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT});

    const footerContent = useMemo(
        () =>
            (!isDismissed || selectedLogins.size > 0) && (
                <>
                    <ReferralProgramCTA
                        referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT}
                        style={selectedLogins.size > 0 ? styles.mb5 : undefined}
                    />

                    {!!selectedLogins.size && (
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
        [isDismissed, selectedLogins.size, styles.mb5, translate, createGroup],
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
            <SelectionList
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
                onConfirm={(e, option) => (selectedLogins.size > 0 ? createGroup() : selectOption(option))}
                rightHandSideComponent={itemRightSideComponent}
                footerContent={footerContent}
                showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                isLoadingNewOptions={!!isSearchingForReports}
                shouldTextInputInterceptSwipe
                addBottomSafeAreaPadding
                textInputAutoFocus={false}
            />
        </ScreenWrapper>
    );
}

NewChatPage.displayName = 'NewChatPage';

export default forwardRef(NewChatPage);
