import Button from '@components/ButtonComposed';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import FormHelpMessage from '@components/FormHelpMessage';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';

import {searchUserInServer} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getFilteredRecentAttendees, getHeaderMessage} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {generateAccountID} from '@libs/UserUtils';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {GestureResponderEvent} from 'react-native';

import {SafeString} from 'expensify-common';
import {deepEqual} from 'fast-equals';
import React, {memo, useEffect} from 'react';

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

function MoneyRequestAttendeeSelector({attendees = [], onFinish, onAttendeesAdded, iouType}: MoneyRequestAttendeesSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const recentAttendeeLogins = getFilteredRecentAttendees(attendees, recentAttendees ?? [], currentUserEmail);

    // Build the initial selection. Attendees that aren't in the personal details list (name-only or unknown emails) get a stable dummy
    // accountID derived from their login (generateAccountID is deterministic), so they can be tracked by accountID like everyone else.
    const initialSelectedOptions = attendees.map((attendee) => {
        // Use || to fall back to displayName for name-only attendees (empty email)
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const login = attendee.email || attendee.displayName;
        const personalDetail = getPersonalDetailByEmail(attendee.email);
        const accountID = personalDetail?.accountID ?? generateAccountID(login);
        return {attendee, login, personalDetail, accountID};
    });

    const initialSelected = new Set(initialSelectedOptions.map((option) => String(option.accountID)));

    // Seed optimistic options for attendees that don't exist in the personal details list so they survive a round-trip through the hook
    const initialExtraOptions: OptionData[] = initialSelectedOptions
        .filter((option) => !option.personalDetail)
        .map((option) => ({
            text: option.attendee.displayName || option.login,
            alternateText: option.login || option.attendee.displayName,
            login: option.login,
            accountID: option.accountID,
            keyForList: option.login,
            isSelected: true,
            icons: [
                {
                    source: option.attendee.avatarUrl || icons.FallbackAvatar,
                    name: option.login,
                    type: CONST.ICON_TYPE_AVATAR,
                    id: option.accountID,
                },
            ],
        }));

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, toggleSelection, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        includeUserToInvite: true,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        includeRecentReports: false,
        includeCurrentUser: true,
        recentAttendees: recentAttendeeLogins,
        shouldAllowNameOnlyOptions: true,
        initialSelected,
        initialExtraOptions,
        shouldInitialize: didScreenTransitionEnd,
        maxRecentReportsToShow: 5,
        // Propagate the selection to the parent directly from the selection event (the hook passes the new selected options)
        onSelectionChange: (_selectedAccountIDs, newSelectedOptions) => {
            const newAttendees: Attendee[] = newSelectedOptions.map((option) => {
                const iconSource = option.icons?.[0]?.source;
                const icon = typeof iconSource === 'function' ? '' : SafeString(iconSource);
                return {
                    email: option.login ?? '',
                    // Use || to fall back for name-only attendees
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    displayName: option.text || option.login || '',
                    avatarUrl: icon,
                };
            });
            onAttendeesAdded(newAttendees);
        },
    });

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const shouldShowErrorMessage = selectedOptions.length < 1;

    const confirmSelection = (_keyEvent?: GestureResponderEvent | KeyboardEvent, option?: OptionData) => {
        if (shouldShowErrorMessage || (!selectedOptions.length && !option)) {
            return;
        }

        onFinish(CONST.IOU.TYPE.SUBMIT);
    };

    const shouldShowLoadingPlaceholder = !areOptionsInitialized || !didScreenTransitionEnd;

    const getFooterContent = () => {
        if (!shouldShowErrorMessage && !selectedOptions.length) {
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
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={confirmSelection}
                    size={CONST.BUTTON_SIZE.LARGE}
                    isDisabled={shouldShowErrorMessage}
                    sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.ATTENDEES_SAVE_BUTTON}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.save')}</Button.Text>
                </Button>
            </>
        );
    };
    const footerContent = getFooterContent();

    let sections: Array<Section<OptionData>>;
    let header: string;
    if (!areOptionsInitialized || !didScreenTransitionEnd) {
        sections = [];
        header = '';
    } else {
        const newSections: Array<Section<OptionData>> = [];
        const cleanSearchTerm = searchTerm.trim().toLowerCase();

        if (availableOptions.selectedOptions.length > 0) {
            newSections.push({
                data: availableOptions.selectedOptions,
                sectionIndex: 0,
            });
        }

        if (availableOptions.recentOptions.length > 0) {
            newSections.push({
                title: translate('common.recents'),
                data: availableOptions.recentOptions,
                sectionIndex: 1,
            });
        }

        if (availableOptions.personalDetails.length > 0) {
            newSections.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
                sectionIndex: 2,
            });
        }

        if (availableOptions.userToInvite) {
            newSections.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                sectionIndex: 3,
            });
        }

        header = newSections.length > 0 ? '' : getHeaderMessage(translate, cleanSearchTerm, countryCode);
        sections = newSections;
    }

    const optionLength = !areOptionsInitialized ? 0 : sections.reduce((acc, section) => acc + (section.data?.length ?? 0), 0);

    const shouldShowListEmptyContent = optionLength === 0 && !shouldShowLoadingPlaceholder;

    const textInputOptions = {
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        hint: offlineMessage,
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage: header,
        disableAutoCorrect: true,
    };

    return (
        <SelectionListWithSections
            sections={areOptionsInitialized ? sections : getEmptyArray<Section<OptionData>>()}
            ListItem={InviteMemberListItem}
            onSelectRow={toggleSelection}
            textInputOptions={textInputOptions}
            confirmButtonOptions={{
                onConfirm: confirmSelection,
            }}
            footerContent={footerContent}
            isLoadingNewOptions={!!isSearchingForReports}
            shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
            shouldShowListEmptyContent={shouldShowListEmptyContent}
            listEmptyContent={<EmptySelectionListContent contentType={iouType} />}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            shouldSingleExecuteRowSelect
            shouldShowTextInput
            canSelectMultiple
        />
    );
}

// eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- attendees array is derived and may have unstable references
export default memo(MoneyRequestAttendeeSelector, (prevProps, nextProps) => deepEqual(prevProps.attendees, nextProps.attendees) && prevProps.iouType === nextProps.iouType);
