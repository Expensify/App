import {useFocusEffect} from '@react-navigation/native';
import reportsSelector from '@selectors/Attributes';
import isEmpty from 'lodash/isEmpty';
import reject from 'lodash/reject';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {Ref} from 'react';
import {Keyboard} from 'react-native';
import Button from '@components/Button';
import {useOptionsList} from '@components/OptionListContextProvider';
import {PressableWithFeedback} from '@components/Pressable';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectCircle from '@components/SelectCircle';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem, SelectionListHandle} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
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
import type {Option, Section} from '@libs/OptionsListUtils';
import {
    filterAndOrderOptions,
    filterSelectedOptions,
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

const excludedGroupEmails = new Set<string>(CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE));

type SelectedOption = ListItem &
    Omit<OptionData, 'reportID'> & {
        reportID?: string;
    };

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'NewChatPage.getValidOptions'});

function useOptions() {
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [newGroupDraft] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const personalData = useCurrentUserPersonalDetails();
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const {contacts} = useContactImport();
    const {options: listOptions, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const defaultOptions = useMemo(() => {
        const filteredOptions = memoizedGetValidOptions(
            {
                reports: listOptions.reports ?? [],
                personalDetails: (listOptions.personalDetails ?? []).concat(contacts),
            },
            draftComments,
            nvpDismissedProductTraining,
            {
                betas: betas ?? [],
                includeSelfDM: true,
            },
            countryCode,
        );
        return filteredOptions;
    }, [listOptions.reports, listOptions.personalDetails, contacts, draftComments, betas, nvpDismissedProductTraining, countryCode]);

    const unselectedOptions = useMemo(() => filterSelectedOptions(defaultOptions, new Set(selectedOptions.map(({accountID}) => accountID))), [defaultOptions, selectedOptions]);

    const options = useMemo(() => {
        const filteredOptions = filterAndOrderOptions(unselectedOptions, debouncedSearchTerm, countryCode, {
            selectedOptions,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });

        return filteredOptions;
    }, [debouncedSearchTerm, unselectedOptions, selectedOptions, countryCode]);
    const cleanSearchTerm = useMemo(() => debouncedSearchTerm.trim().toLowerCase(), [debouncedSearchTerm]);
    const headerMessage = useMemo(() => {
        return getHeaderMessage(
            options.personalDetails.length + options.recentReports.length !== 0,
            !!options.userToInvite,
            debouncedSearchTerm.trim(),
            countryCode,
            selectedOptions.some((participant) => getPersonalDetailSearchTerms(participant).join(' ').toLowerCase?.().includes(cleanSearchTerm)),
        );
    }, [cleanSearchTerm, debouncedSearchTerm, options.personalDetails.length, options.recentReports.length, options.userToInvite, selectedOptions, countryCode]);

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
        if (!newGroupDraft?.participants) {
            return;
        }
        const newSelectedOptions: OptionData[] = [];
        for (const participant of newGroupDraft.participants) {
            if (participant.accountID === personalData.accountID) {
                continue;
            }
            let participantOption: OptionData | undefined | null = listOptions.personalDetails.find((option) => option.accountID === participant.accountID);
            if (!participantOption) {
                participantOption = getUserToInviteOption({
                    searchValue: participant?.login,
                });
            }
            if (!participantOption) {
                continue;
            }
            newSelectedOptions.push({
                ...participantOption,
                isSelected: true,
            });
        }
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
    const {top} = useSafeAreaInsets();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const selectionListRef = useRef<SelectionListHandle | null>(null);

    const {singleExecution} = useSingleExecution();

    useImperativeHandle(ref, () => ({
        focus: selectionListRef.current?.focusTextInput,
    }));

    const {headerMessage, searchTerm, debouncedSearchTerm, setSearchTerm, selectedOptions, setSelectedOptions, recentReports, personalDetails, userToInvite, areOptionsInitialized} =
        useOptions();

    const [sections, firstKeyForList] = useMemo(() => {
        const sectionsList: Section[] = [];
        let firstKey = '';

        const formatResults = formatSectionsFromSearchTerm(
            debouncedSearchTerm,
            selectedOptions as OptionData[],
            recentReports,
            personalDetails,
            undefined,
            undefined,
            undefined,
            reportAttributesDerived,
        );
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
    }, [debouncedSearchTerm, selectedOptions, recentReports, personalDetails, reportAttributesDerived, translate, userToInvite]);

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
                if (option?.login && excludedGroupEmails.has(option.login)) {
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
            KeyboardUtils.dismiss().then(() => {
                singleExecution(() => navigateToAndOpenReport([login]))();
            });
        },
        [selectedOptions, toggleOption, singleExecution],
    );

    const itemRightSideComponent = useCallback(
        (item: ListItem & Option, isFocused?: boolean) => {
            if (!!item.isSelfDM || (item.login && excludedGroupEmails.has(item.login))) {
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

export default NewChatPage;
