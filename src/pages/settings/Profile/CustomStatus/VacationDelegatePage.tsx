import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useBetas} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActions from '@libs/actions/Report';
import {deleteVacationDelegate, setVacationDelegate} from '@libs/actions/VacationDelegate';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import * as Expensicons from '@components/Icon/Expensicons';
import type {Participant} from '@src/types/onyx/IOU';

function useOptions() {
    const betas = useBetas();
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {options: optionsList, areOptionsInitialized} = useOptionsList();
    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {canBeMissing: true});
    const currentVacationDelegate = vacationDelegate?.delegate;
    const excludeLogins = useMemo(
        () => ({
            ...CONST.EXPENSIFY_EMAILS_OBJECT,
            [currentVacationDelegate ?? '']: true,
        }),
        [currentVacationDelegate],
    );

    const defaultOptions = useMemo(() => {
        const {recentReports, personalDetails, userToInvite, currentUserOption} = OptionsListUtils.getValidOptions(
            {
                reports: optionsList.reports,
                personalDetails: optionsList.personalDetails,
            },
            {
                betas,
                excludeLogins,
            },
        );

        const headerMessage = OptionsListUtils.getHeaderMessage((recentReports?.length || 0) + (personalDetails?.length || 0) !== 0, !!userToInvite, '');

        if (isLoading) {
            // eslint-disable-next-line react-compiler/react-compiler
            setIsLoading(false);
        }

        return {
            userToInvite,
            recentReports,
            personalDetails,
            currentUserOption,
            headerMessage,
        };
    }, [optionsList.reports, optionsList.personalDetails, betas, excludeLogins, isLoading]);

    const options = useMemo(() => {
        const filteredOptions = OptionsListUtils.filterAndOrderOptions(defaultOptions, debouncedSearchValue.trim(), {
            excludeLogins,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        const headerMessage = OptionsListUtils.getHeaderMessage(
            (filteredOptions.recentReports?.length || 0) + (filteredOptions.personalDetails?.length || 0) !== 0,
            !!filteredOptions.userToInvite,
            debouncedSearchValue,
        );

        return {
            ...filteredOptions,
            headerMessage,
        };
    }, [debouncedSearchValue, defaultOptions, excludeLogins]);

    return {...options, currentVacationDelegate, searchValue, debouncedSearchValue, setSearchValue, areOptionsInitialized};
}

function VacationDelegatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const {currentVacationDelegate, userToInvite, recentReports, personalDetails, searchValue, debouncedSearchValue, setSearchValue, headerMessage, areOptionsInitialized} = useOptions();
    const delegatePersonalDetails = getPersonalDetailByEmail(currentVacationDelegate ?? '');

    const sections = useMemo(() => {
        const sectionsList = [];

        if (currentVacationDelegate && delegatePersonalDetails) {
            sectionsList.push({
                title: undefined,
                data: [
                    {
                        ...delegatePersonalDetails,
                        text: delegatePersonalDetails?.displayName ?? '',
                        alternateText: delegatePersonalDetails?.login ?? undefined,
                        login: delegatePersonalDetails.login ?? undefined,
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
                text: option?.text ?? option?.displayName ?? '',
                alternateText: option?.alternateText ?? option?.login ?? undefined,
                keyForList: option.keyForList ?? '',
                isDisabled: option.isDisabled ?? undefined,
                isSelected: option.isSelected ?? undefined,
                login: option.login ?? undefined,
                shouldShowSubscript: option.shouldShowSubscript ?? undefined,
            })),
        }));
    }, [currentVacationDelegate, delegatePersonalDetails, personalDetails, recentReports, translate, userToInvite]);

    const onSelectRow = useCallback(
        (option: Participant) => {
            if (option?.login === currentVacationDelegate) {
                deleteVacationDelegate();
                Navigation.goBack(ROUTES.SETTINGS_STATUS);
                return;
            }

            setVacationDelegate(currentUserLogin ?? '', option?.login ?? '');
            Navigation.goBack(ROUTES.SETTINGS_STATUS);
        },
        [currentUserLogin, currentVacationDelegate],
    );

    useEffect(() => {
        ReportActions.searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={VacationDelegatePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('statusPage.vacationDelegate')}
                onBackButtonPress={() => Navigation.goBack()}
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
    );
}

VacationDelegatePage.displayName = 'VacationDelegatePage';

export default VacationDelegatePage;
