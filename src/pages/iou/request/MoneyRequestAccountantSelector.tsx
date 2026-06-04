import lodashPick from 'lodash/pick';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailOptions from '@hooks/usePersonalDetailOptions';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import memoize from '@libs/memoize';
import {getHeaderMessage, getValidOptions} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils/types';
import {searchUserInServer} from '@userActions/Report';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Accountant} from '@src/types/onyx/IOU';

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'MoneyRequestAccountantSelector.getValidOptions'});

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [] as OptionData[],
    personalDetails: [] as OptionData[],
    selectedOptions: [] as OptionData[],
};

type MoneyRequestAccountantSelectorProps = {
    /** Callback to request parent modal to go to next step */
    onFinish: (value?: string) => void;

    /** Callback to set accountant in MoneyRequestModal */
    onAccountantSelected: (value: Accountant) => void;

    /** The type of IOU report, i.e. split, request, send, track */
    iouType: IOUType;
};

function MoneyRequestAccountantSelector({onFinish, onAccountantSelected, iouType}: MoneyRequestAccountantSelectorProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {isOffline} = useNetwork();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const {options: personalDetailOptions} = usePersonalDetailOptions({enabled: didScreenTransitionEnd});
    const areOptionsInitialized = (personalDetailOptions?.length ?? 0) > 0;
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const optionsList = useMemo(() => {
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return defaultListOptions;
        }

        return memoizedGetValidOptions(personalDetailOptions ?? [], currentUserEmail, formatPhoneNumber, countryCode, loginList, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            searchString: debouncedSearchTerm,
            includeUserToInvite: true,
        });
    }, [areOptionsInitialized, didScreenTransitionEnd, personalDetailOptions, currentUserEmail, formatPhoneNumber, countryCode, loginList, debouncedSearchTerm]);

    const sections = useMemo(() => {
        const newSections: Array<Section<OptionData>> = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return newSections;
        }

        let sectionIndex = 0;

        if (optionsList.recentOptions.length > 0) {
            newSections.push({
                title: translate('common.recents'),
                data: optionsList.recentOptions,
                sectionIndex: sectionIndex++,
            });
        }

        if (optionsList.personalDetails.length > 0) {
            newSections.push({
                title: translate('common.contacts'),
                data: optionsList.personalDetails,
                sectionIndex: sectionIndex++,
            });
        }

        if (optionsList.userToInvite) {
            newSections.push({
                data: [optionsList.userToInvite],
                sectionIndex: sectionIndex++,
            });
        }

        return newSections;
    }, [areOptionsInitialized, didScreenTransitionEnd, optionsList.recentOptions, optionsList.personalDetails, optionsList.userToInvite, translate]);

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

    const getHeaderMessageText = () => {
        if (sections.length > 0) {
            return '';
        }
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        return getHeaderMessage(translate, debouncedSearchTerm, countryCode);
    };

    const shouldShowLoadingPlaceholder = useMemo(() => !areOptionsInitialized || !didScreenTransitionEnd, [areOptionsInitialized, didScreenTransitionEnd]);

    const optionLength = useMemo(() => {
        if (!areOptionsInitialized) {
            return 0;
        }
        return sections.reduce((acc, section) => acc + section.data.length, 0);
    }, [areOptionsInitialized, sections]);

    const shouldShowListEmptyContent = useMemo(() => optionLength === 0 && !shouldShowLoadingPlaceholder, [optionLength, shouldShowLoadingPlaceholder]);

    const textInputOptions = {
        value: searchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        onChangeText: setSearchTerm,
        headerMessage: getHeaderMessageText(),
        hint: offlineMessage,
    };

    return (
        <SelectionListWithSections
            sections={areOptionsInitialized ? sections : []}
            ListItem={InviteMemberListItem}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onSelectRow={selectAccountant}
            confirmButtonOptions={{
                onConfirm: handleConfirmSelection,
            }}
            shouldShowTextInput
            shouldSingleExecuteRowSelect
            textInputOptions={textInputOptions}
            listEmptyContent={<EmptySelectionListContent contentType={iouType} />}
            shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
            isLoadingNewOptions={!!isSearchingForReports}
            shouldShowListEmptyContent={shouldShowListEmptyContent}
        />
    );
}

export default memo(MoneyRequestAccountantSelector, (prevProps, nextProps) => prevProps.iouType === nextProps.iouType);
