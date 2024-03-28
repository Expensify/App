import isEmpty from 'lodash/isEmpty';
import reject from 'lodash/reject';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import {useBetas, usePersonalDetails} from '@components/OnyxProvider';
import {PressableWithFeedback} from '@components/Pressable';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import SelectCircle from '@components/SelectCircle';
import SelectionList from '@components/SelectionList';
import type {ListItem, Section} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type NewChatPageWithOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<OnyxTypes.Report>;

    /** Whether we are searching for reports in the server */
    isSearchingForReports: OnyxEntry<boolean>;
};

type NewChatPageProps = NewChatPageWithOnyxProps & {
    isGroupChat: boolean;
};

const excludedGroupEmails = CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE);

const EMPTY_ARRAY: Array<SectionListData<ListItem, Section<ListItem>>> = [];

function useOptions({reports, isGroupChat}: Omit<NewChatPageProps, 'isSearchingForReports'>) {
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const personalDetails = usePersonalDetails();
    const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails);
    const [selectedOptions, setSelectedOptions] = useState<Array<ListItem & OptionData>>([]);
    const betas = useBetas();

    const options = useMemo(() => {
        const filteredOptions = OptionsListUtils.getFilteredOptions(
            reports,
            personalDetails,
            betas,
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
            false,
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
    }, [betas, debouncedSearchTerm, isGroupChat, personalDetails, reports, selectedOptions]);

    useEffect(() => {
        if (!debouncedSearchTerm.length || options.maxParticipantsReached) {
            return;
        }

        Report.searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm, options.maxParticipantsReached]);

    return {...options, searchTerm, debouncedSearchTerm, setSearchTerm, isOptionsDataReady, selectedOptions, setSelectedOptions};
}

function NewChatPage({isGroupChat, reports, isSearchingForReports}: NewChatPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();

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
        isOptionsDataReady,
    } = useOptions({
        reports,
        isGroupChat,
    });

    const [sections, firstKeyForList] = useMemo(() => {
        const sectionsList = [];
        let firstKey = '';
        let indexOffset = 0;

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(debouncedSearchTerm, selectedOptions, recentReports, personalDetails, maxParticipantsReached, indexOffset);
        sectionsList.push(formatResults.section);
        indexOffset = formatResults.newIndexOffset;
        if (!firstKey) {
            firstKey = OptionsListUtils.getFirstKeyForList(formatResults.section.data);
        }

        if (maxParticipantsReached) {
            return [sectionsList as unknown as Array<SectionListData<ListItem, Section<ListItem>>>, firstKey];
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: recentReports,
            shouldShow: !isEmpty(recentReports),
            indexOffset,
        });
        indexOffset += recentReports.length;
        if (!firstKey) {
            firstKey = OptionsListUtils.getFirstKeyForList(recentReports);
        }

        sectionsList.push({
            title: translate('common.contacts'),
            data: personalDetails,
            shouldShow: !isEmpty(personalDetails),
            indexOffset,
        });
        indexOffset += personalDetails.length;
        if (!firstKey) {
            firstKey = OptionsListUtils.getFirstKeyForList(personalDetails);
        }

        if (userToInvite) {
            sectionsList.push({
                title: undefined,
                data: [userToInvite],
                shouldShow: true,
                indexOffset,
            });
            if (!firstKey) {
                firstKey = OptionsListUtils.getFirstKeyForList([userToInvite]);
            }
        }

        return [sectionsList as unknown as Array<SectionListData<ListItem, Section<ListItem>>>, firstKey];
    }, [debouncedSearchTerm, selectedOptions, recentReports, personalDetails, maxParticipantsReached, translate, userToInvite]);

    /**
     * Creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    const createChat = (option: ListItem) => {
        if (!option.login) {
            return;
        }
        Report.navigateToAndOpenReport([option.login]);
    };

    const itemRightSideComponent = useCallback(
        (listItem: ListItem) => {
            const item = listItem as ListItem & OptionData;
            /**
             * Removes a selected option from list if already selected. If not already selected add this option to the list.
             * @param  option
             */
            function toggleOption(option: ListItem & OptionData) {
                const isOptionInList = !!option.isSelected;

                let newSelectedOptions: Array<ListItem & OptionData>;

                if (isOptionInList) {
                    newSelectedOptions = reject(selectedOptions, (selectedOption) => selectedOption.login === option.login);
                } else {
                    newSelectedOptions = [...selectedOptions, {...option, isSelected: true, selected: true}];
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
            const logins = selectedOptions.map((option) => option.login).filter((login): login is string => typeof login === 'string');

            if (logins.length < 1) {
                return;
            }

            Report.navigateToAndOpenReport(logins);
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
                        text={selectedOptions.length > 1 ? translate('newChatPage.createGroup') : translate('newChatPage.createChat')}
                        onPress={createGroup}
                        pressOnEnter
                    />
                )}
            </>
        );
    }, [selectedOptions, styles, translate]);

    const {insets} = useStyledSafeAreaInsets();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();

    return (
        <View
            testID={NewChatPage.displayName}
            style={styles.flex1}
        >
            <KeyboardAvoidingView
                style={styles.flex1}
                behavior="padding"
                // Offset is needed as KeyboardAvoidingView in nested inside of TabNavigator instead of wrapping whole screen.
                // This is because when wrapping whole screen the screen was freezing when changing Tabs.
                keyboardVerticalOffset={variables.contentHeaderHeight + insets.top + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding}
            >
                <SelectionList
                    ListItem={UserListItem}
                    sections={isOptionsDataReady && didScreenTransitionEnd ? sections : EMPTY_ARRAY}
                    textInputValue={searchTerm}
                    textInputHint={isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''}
                    onChangeText={setSearchTerm}
                    textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                    headerMessage={headerMessage}
                    onSelectRow={createChat}
                    rightHandSideComponent={itemRightSideComponent}
                    footerContent={footerContent}
                    showLoadingPlaceholder={!didScreenTransitionEnd}
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

export default withOnyx<NewChatPageProps, NewChatPageWithOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    isSearchingForReports: {
        key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
        initWithStoredValues: false,
    },
})(NewChatPage);
