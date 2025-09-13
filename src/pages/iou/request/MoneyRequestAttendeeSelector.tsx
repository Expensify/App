import {deepEqual} from 'fast-equals';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import Button from '@components/Button';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import FormHelpMessage from '@components/FormHelpMessage';
import {usePersonalDetailsOptionsList} from '@components/PersonalDetailsOptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import memoize from '@libs/memoize';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import {getUserToInviteOption, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import {searchInServer} from '@userActions/Report';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

type MoneyRequestAttendeesSelectorProps = {
    /** Callback to request parent modal to go to next step, which should be split */
    onFinish: (value?: string) => void;

    /** Callback to add participants in MoneyRequestModal */
    onAttendeesAdded: (value: Attendee[]) => void;

    /** Selected participants from MoneyRequestModal with login */
    attendees?: Attendee[];

    /** The type of IOU report, i.e. split, request, send, track */
    iouType: IOUType;
};

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'MoneyRequestAttendeeSelector.getValidOptions'});

function MoneyRequestAttendeeSelector({attendees = [], onFinish, onAttendeesAdded, iouType}: MoneyRequestAttendeesSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {login: currentLogin} = useCurrentUserPersonalDetails();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {isOffline} = useNetwork();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES, {canBeMissing: true});
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const {options, areOptionsInitialized} = usePersonalDetailsOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const selectedAttendeeLogins = useMemo(() => new Set(attendees.map((attendee) => attendee.email)), [attendees]);
    const existingLogins = useMemo(() => new Set(options.map((option) => option.login ?? '')), [options]);
    const extraLogins = useMemo(() => Array.from(selectedAttendeeLogins.difference(existingLogins)), [selectedAttendeeLogins, existingLogins]);
    const extraOptions = useMemo(() => {
        const newOptions: OptionData[] = [];
        for (const login of extraLogins) {
            const newOption = getUserToInviteOption({searchValue: login, loginsToExclude: CONST.EXPENSIFY_EMAILS_OBJECT, shouldAcceptName: true});
            if (newOption) {
                newOptions.push({...newOption, isSelected: true});
            }
        }
        return newOptions;
    }, [extraLogins]);

    const transformedOptions = useMemo(
        () =>
            options.map((option) => ({
                ...option,
                isSelected: selectedAttendeeLogins.has(option.login ?? ''),
            })),
        [options, selectedAttendeeLogins],
    );

    const optionsList = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return memoizedGetValidOptions(transformedOptions, currentLogin ?? '', {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            extraOptions,
            includeRecentReports: false,
            searchString: debouncedSearchTerm,
            includeCurrentUser: true,
            includeUserToInvite: true,
            shouldAcceptName: true,
            recentAttendees: recentAttendees?.map((attendee) => attendee.email),
        });
    }, [areOptionsInitialized, currentLogin, debouncedSearchTerm, extraOptions, recentAttendees, transformedOptions]);

    const sections = useMemo(() => {
        const sectionsArr = [];

        if (!areOptionsInitialized) {
            return [];
        }

        if (optionsList.userToInvite) {
            sectionsArr.push({
                title: undefined,
                data: [optionsList.userToInvite],
                shouldShow: true,
            });
        } else {
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
    }, [areOptionsInitialized, optionsList.userToInvite, optionsList.selectedOptions, optionsList.recentOptions, optionsList.personalDetails, translate]);

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const addAttendeeToSelection = useCallback(
        (option: OptionData) => {
            const isOptionInList = option.isSelected;
            let newSelectedOptions: Attendee[];

            if (isOptionInList) {
                newSelectedOptions = attendees.filter((attendee) => attendee.email !== option.login);
            } else {
                const iconSource = option.icons?.[0]?.source;
                const icon = typeof iconSource === 'function' ? '' : (iconSource?.toString() ?? '');
                newSelectedOptions = [
                    ...attendees,
                    {
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        email: option.login || option.text,
                        displayName: option.text,
                        avatarUrl: icon,
                    },
                ];
            }
            onAttendeesAdded(newSelectedOptions);
        },
        [attendees, onAttendeesAdded],
    );

    const shouldShowErrorMessage = attendees.length < 1;

    const handleConfirmSelection = useCallback(
        (_keyEvent?: GestureResponderEvent | KeyboardEvent, option?: OptionData) => {
            if (shouldShowErrorMessage || (!attendees.length && !option)) {
                return;
            }

            onFinish(CONST.IOU.TYPE.SUBMIT);
        },
        [shouldShowErrorMessage, onFinish, attendees],
    );

    const showLoadingPlaceholder = useMemo(() => !areOptionsInitialized || !didScreenTransitionEnd, [areOptionsInitialized, didScreenTransitionEnd]);

    const optionLength = useMemo(() => {
        if (!areOptionsInitialized) {
            return 0;
        }
        return sections.reduce((acc, section) => acc + section.data.length, 0);
    }, [areOptionsInitialized, sections]);

    const shouldShowListEmptyContent = useMemo(() => optionLength === 0 && !showLoadingPlaceholder, [optionLength, showLoadingPlaceholder]);

    const footerContent = useMemo(() => {
        if (!shouldShowErrorMessage && !attendees.length) {
            return;
        }

        return (
            <>
                {shouldShowErrorMessage && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message={translate('iou.error.atLeastOneAttendee')}
                    />
                )}
                <Button
                    success
                    text={translate('common.save')}
                    onPress={handleConfirmSelection}
                    pressOnEnter
                    large
                    isDisabled={shouldShowErrorMessage}
                />
            </>
        );
    }, [handleConfirmSelection, attendees.length, shouldShowErrorMessage, styles, translate]);

    return (
        <SelectionList
            onConfirm={handleConfirmSelection}
            sections={areOptionsInitialized ? sections : CONST.EMPTY_ARRAY}
            ListItem={InviteMemberListItem}
            textInputValue={searchTerm}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            textInputHint={offlineMessage}
            onChangeText={setSearchTerm}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onSelectRow={addAttendeeToSelection}
            shouldSingleExecuteRowSelect
            footerContent={footerContent}
            autoCorrect={false}
            listEmptyContent={<EmptySelectionListContent contentType={iouType} />}
            headerMessage={sections.length === 0 ? translate('common.noResultsFound') : undefined}
            showLoadingPlaceholder={showLoadingPlaceholder}
            canSelectMultiple
            isLoadingNewOptions={!!isSearchingForReports}
            shouldShowListEmptyContent={shouldShowListEmptyContent}
        />
    );
}

MoneyRequestAttendeeSelector.displayName = 'MoneyRequestAttendeeSelector';

export default memo(MoneyRequestAttendeeSelector, (prevProps, nextProps) => deepEqual(prevProps.attendees, nextProps.attendees) && prevProps.iouType === nextProps.iouType);
