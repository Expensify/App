import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetailsOptionsList} from '@components/PersonalDetailsOptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {clearVacationDelegateError, deleteVacationDelegate, setVacationDelegate} from '@libs/actions/VacationDelegate';
import memoize from '@libs/memoize';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import {getHeaderMessage, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'VacationDelegatePage.getValidOptions'});

function VacationDelegatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [newVacationDelegate, setNewVacationDelegate] = useState<OptionData | undefined>(undefined);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {options, areOptionsInitialized} = usePersonalDetailsOptionsList();
    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {canBeMissing: true});
    const currentVacationDelegate = vacationDelegate?.delegate;

    const transformedOptions = useMemo(() => {
        if (!currentVacationDelegate) {
            return options;
        }
        return options.map((option) => ({
            ...option,
            isSelected: option.login === currentVacationDelegate,
        }));
    }, [currentVacationDelegate, options]);

    const optionsList = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return memoizedGetValidOptions(transformedOptions, currentUserLogin ?? '', {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            includeRecentReports: true,
            searchString: debouncedSearchValue,
            includeCurrentUser: false,
            includeUserToInvite: true,
        });
    }, [areOptionsInitialized, currentUserLogin, debouncedSearchValue, transformedOptions]);

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

    const headerMessage = useMemo(() => (sections.length === 0 ? getHeaderMessage(translate, debouncedSearchValue.trim()) : ''), [sections.length, translate, debouncedSearchValue]);

    const onSelectRow = useCallback(
        (option: OptionData) => {
            // Clear search to prevent "No results found" after selection
            setSearchValue('');

            if (option?.login === vacationDelegate?.delegate) {
                deleteVacationDelegate(vacationDelegate);
                Navigation.goBack(ROUTES.SETTINGS_STATUS);
                return;
            }

            setVacationDelegate(currentUserLogin ?? '', option?.login ?? '', false, vacationDelegate?.delegate).then((response) => {
                if (!response?.jsonCode) {
                    Navigation.goBack(ROUTES.SETTINGS_STATUS);
                    return;
                }

                if (response.jsonCode === CONST.JSON_CODE.POLICY_DIFF_WARNING) {
                    setIsWarningModalVisible(true);
                    setNewVacationDelegate(option);
                    return;
                }

                Navigation.goBack(ROUTES.SETTINGS_STATUS);
            });
        },
        [currentUserLogin, vacationDelegate, setSearchValue],
    );

    useEffect(() => {
        searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);

    return (
        <>
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={VacationDelegatePage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('statusPage.vacationDelegate')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
                />
                <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionList
                        sections={sections}
                        ListItem={UserListItem}
                        onSelectRow={onSelectRow}
                        shouldSingleExecuteRowSelect
                        onChangeText={setSearchValue}
                        textInputValue={searchValue}
                        headerMessage={headerMessage}
                        textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                        showLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                    />
                </View>
            </ScreenWrapper>
            <ConfirmModal
                isVisible={isWarningModalVisible}
                title={translate('common.headsUp')}
                prompt={translate('statusPage.vacationDelegateWarning', {nameOrEmail: newVacationDelegate?.text ?? newVacationDelegate?.login ?? ''})}
                onConfirm={() => {
                    setIsWarningModalVisible(false);
                    setVacationDelegate(currentUserLogin ?? '', newVacationDelegate?.login ?? '', true, vacationDelegate?.delegate).then(() => Navigation.goBack(ROUTES.SETTINGS_STATUS));
                }}
                onCancel={() => {
                    setIsWarningModalVisible(false);
                    clearVacationDelegateError(vacationDelegate?.previousDelegate);
                }}
                confirmText={translate('common.confirm')}
                cancelText={translate('common.cancel')}
            />
        </>
    );
}

VacationDelegatePage.displayName = 'VacationDelegatePage';

export default VacationDelegatePage;
