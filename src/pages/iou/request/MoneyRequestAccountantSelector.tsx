import lodashPick from 'lodash/pick';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import {usePersonalDetailsOptionsList} from '@components/PersonalDetailsOptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import memoize from '@libs/memoize';
import {getHeaderMessage, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import {searchInServer} from '@userActions/Report';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Accountant} from '@src/types/onyx/IOU';

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'MoneyRequestAccountantSelector.getValidOptions'});

type MoneyRequestAccountantSelectorProps = {
    /** Callback to request parent modal to go to next step */
    onFinish: (value?: string) => void;

    /** Callback to set accountant in MoneyRequestModal */
    onAccountantSelected: (value: Accountant) => void;

    /** The type of IOU report, i.e. split, request, send, track */
    iouType: IOUType;
};

type SectionBase = {
    title: string | undefined;
    shouldShow: boolean;
};

type Section = SectionBase & {
    data: OptionData[];
};

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};

function MoneyRequestAccountantSelector({onFinish, onAccountantSelected, iouType}: MoneyRequestAccountantSelectorProps) {
    const {translate} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {isOffline} = useNetwork();
    const {login: currentLogin} = useCurrentUserPersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const {options, areOptionsInitialized} = usePersonalDetailsOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const optionsList = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return memoizedGetValidOptions(options, currentLogin ?? '', {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            includeRecentReports: true,
            searchString: debouncedSearchTerm,
            includeCurrentUser: false,
            includeUserToInvite: true,
        });
    }, [areOptionsInitialized, currentLogin, debouncedSearchTerm, options]);

    /**
     * Returns the sections needed for the OptionsSelector
     */
    const [sections, header] = useMemo(() => {
        const newSections: Section[] = [];
        if (!areOptionsInitialized) {
            return [CONST.EMPTY_ARRAY, ''];
        }

        if (optionsList.userToInvite) {
            newSections.push({
                title: undefined,
                data: [optionsList.userToInvite],
                shouldShow: true,
            });
        } else {
            if (optionsList.recentOptions.length > 0) {
                newSections.push({
                    title: translate('common.recents'),
                    data: optionsList.recentOptions,
                    shouldShow: true,
                });
            }
            if (optionsList.personalDetails.length > 0) {
                newSections.push({
                    title: translate('common.contacts'),
                    data: optionsList.personalDetails,
                    shouldShow: true,
                });
            }
        }

        const headerMessage = newSections.length === 0 ? getHeaderMessage(translate, debouncedSearchTerm.trim()) : '';

        return [newSections, headerMessage];
    }, [areOptionsInitialized, optionsList.userToInvite, optionsList.recentOptions, optionsList.personalDetails, translate, debouncedSearchTerm]);

    const selectAccountant = useCallback(
        (option: Accountant) => {
            onAccountantSelected(lodashPick(option, 'accountID', 'login'));
            onFinish();
        },
        [onAccountantSelected, onFinish],
    );

    const handleConfirmSelection = useCallback(
        (keyEvent?: GestureResponderEvent | KeyboardEvent, option?: Accountant) => {
            if (!option) {
                return;
            }

            selectAccountant(option);
        },
        [selectAccountant],
    );

    const showLoadingPlaceholder = useMemo(() => !areOptionsInitialized || !didScreenTransitionEnd, [areOptionsInitialized, didScreenTransitionEnd]);

    const shouldShowListEmptyContent = useMemo(() => sections.length === 0 && !showLoadingPlaceholder, [sections, showLoadingPlaceholder]);

    return (
        <SelectionList
            onConfirm={handleConfirmSelection}
            sections={sections}
            ListItem={InviteMemberListItem}
            textInputValue={searchTerm}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            textInputHint={offlineMessage}
            onChangeText={setSearchTerm}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onSelectRow={selectAccountant}
            shouldSingleExecuteRowSelect
            listEmptyContent={<EmptySelectionListContent contentType={iouType} />}
            headerMessage={header}
            showLoadingPlaceholder={showLoadingPlaceholder}
            isLoadingNewOptions={!!isSearchingForReports}
            shouldShowListEmptyContent={shouldShowListEmptyContent}
        />
    );
}

MoneyRequestAccountantSelector.displayName = 'MoneyRequestAccountantSelector';

export default memo(MoneyRequestAccountantSelector, (prevProps, nextProps) => prevProps.iouType === nextProps.iouType);
