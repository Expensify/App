import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import {useBetas} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {clearVacationDelegateError, deleteVacationDelegate, setVacationDelegate} from '@libs/actions/VacationDelegate';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import {filterAndOrderOptions, getHeaderMessage, getValidOptions} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Participant} from '@src/types/onyx/IOU';

function useOptions() {
    const betas = useBetas();
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {options: optionsList, areOptionsInitialized} = useOptionsList();
    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {canBeMissing: true});
    const currentVacationDelegate = vacationDelegate?.delegate;
    const delegatePersonalDetails = getPersonalDetailByEmail(currentVacationDelegate ?? '');
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});

    const excludeLogins = useMemo(
        () => ({
            ...CONST.EXPENSIFY_EMAILS_OBJECT,
            [currentVacationDelegate ?? '']: true,
        }),
        [currentVacationDelegate],
    );

    const defaultOptions = useMemo(() => {
        const {recentReports, personalDetails, userToInvite, currentUserOption} = getValidOptions(
            {
                reports: optionsList.reports,
                personalDetails: optionsList.personalDetails,
            },
            draftComments,
            {
                betas,
                excludeLogins,
            },
            countryCode,
        );

        const headerMessage = getHeaderMessage((recentReports?.length || 0) + (personalDetails?.length || 0) !== 0, !!userToInvite, '', false, countryCode);

        return {
            userToInvite,
            recentReports,
            personalDetails,
            currentUserOption,
            headerMessage,
        };
    }, [optionsList.reports, optionsList.personalDetails, draftComments, betas, excludeLogins, countryCode]);

    const options = useMemo(() => {
        const filteredOptions = filterAndOrderOptions(defaultOptions, debouncedSearchValue.trim(), countryCode, {
            excludeLogins,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        const headerMessage = getHeaderMessage(
            (filteredOptions.recentReports?.length || 0) + (filteredOptions.personalDetails?.length || 0) !== 0,
            !!filteredOptions.userToInvite,
            debouncedSearchValue,
            false,
            countryCode,
        );

        return {
            ...filteredOptions,
            headerMessage,
        };
    }, [debouncedSearchValue, defaultOptions, excludeLogins, countryCode]);

    return {...options, vacationDelegate, searchValue, debouncedSearchValue, setSearchValue, areOptionsInitialized, delegatePersonalDetails};
}

function VacationDelegatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [newVacationDelegate, setNewVacationDelegate] = useState('');
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: false});
    const {vacationDelegate, userToInvite, recentReports, personalDetails, searchValue, debouncedSearchValue, setSearchValue, headerMessage, areOptionsInitialized, delegatePersonalDetails} =
        useOptions();

    const sections = useMemo(() => {
        const sectionsList = [];

        if (vacationDelegate && delegatePersonalDetails) {
            sectionsList.push({
                title: undefined,
                data: [
                    {
                        ...delegatePersonalDetails,
                        text: delegatePersonalDetails?.displayName ?? vacationDelegate.delegate,
                        alternateText: delegatePersonalDetails?.login ?? vacationDelegate.delegate,
                        login: delegatePersonalDetails.login ?? vacationDelegate.delegate,
                        keyForList: `vacationDelegate-${delegatePersonalDetails.login}`,
                        isDisabled: false,
                        isSelected: true,
                        shouldShowSubscript: undefined,
                        icons: [
                            {
                                source: delegatePersonalDetails?.avatar ?? Expensicons.FallbackAvatar,
                                name: formatPhoneNumber(delegatePersonalDetails?.login ?? ''),
                                type: CONST.ICON_TYPE_AVATAR,
                                id: delegatePersonalDetails?.accountID,
                            },
                        ],
                    },
                ],
                shouldShow: true,
            });
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: recentReports,
            shouldShow: recentReports?.length > 0,
        });

        sectionsList.push({
            title: translate('common.contacts'),
            data: personalDetails,
            shouldShow: personalDetails?.length > 0,
        });

        if (userToInvite) {
            sectionsList.push({
                title: undefined,
                data: [userToInvite],
                shouldShow: true,
            });
        }

        return sectionsList.map((section) => ({
            ...section,
            data: section.data.map((option) => ({
                ...option,
                text: option.text ?? option.displayName ?? '',
                alternateText: option.alternateText ?? option.login ?? undefined,
                keyForList: option.keyForList ?? '',
                isDisabled: option.isDisabled ?? undefined,
                isSelected: option.isSelected ?? undefined,
                login: option.login ?? undefined,
                shouldShowSubscript: option.shouldShowSubscript ?? undefined,
            })),
        }));
    }, [vacationDelegate, delegatePersonalDetails, personalDetails, recentReports, translate, userToInvite]);

    const onSelectRow = useCallback(
        (option: Participant) => {
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
                    setNewVacationDelegate(option?.login ?? '');
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
                        sections={areOptionsInitialized ? sections : []}
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
                prompt={translate('statusPage.vacationDelegateWarning', {nameOrEmail: getPersonalDetailByEmail(newVacationDelegate)?.displayName ?? newVacationDelegate})}
                onConfirm={() => {
                    setIsWarningModalVisible(false);
                    setVacationDelegate(currentUserLogin ?? '', newVacationDelegate, true, vacationDelegate?.delegate).then(() => Navigation.goBack(ROUTES.SETTINGS_STATUS));
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
