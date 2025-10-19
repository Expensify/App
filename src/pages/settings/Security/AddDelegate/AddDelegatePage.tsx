import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useBetas} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import memoize from '@libs/memoize';
import Navigation from '@libs/Navigation/Navigation';
import {filterAndOrderOptions, getHeaderMessage, getValidOptions} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Participant} from '@src/types/onyx/IOU';

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'AddDelegatePage.getValidOptions'});

function useOptions() {
    const betas = useBetas();
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {options: optionsList, areOptionsInitialized} = useOptionsList();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const existingDelegates = useMemo(
        () =>
            account?.delegatedAccess?.delegates?.reduce(
                (prev, {email}) => {
                    // eslint-disable-next-line no-param-reassign
                    prev[email] = true;
                    return prev;
                },
                {} as Record<string, boolean>,
            ),
        [account?.delegatedAccess?.delegates],
    );

    const defaultOptions = useMemo(() => {
        const {recentReports, personalDetails, userToInvite, currentUserOption} = memoizedGetValidOptions(
            {
                reports: optionsList.reports,
                personalDetails: optionsList.personalDetails,
            },
            draftComments,
            {
                betas,
                excludeLogins: {...CONST.EXPENSIFY_EMAILS_OBJECT, ...existingDelegates},
            },
            countryCode,
        );

        const headerMessage = getHeaderMessage((recentReports?.length || 0) + (personalDetails?.length || 0) !== 0, !!userToInvite, '', false, countryCode);

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
    }, [optionsList.reports, optionsList.personalDetails, draftComments, betas, existingDelegates, isLoading, countryCode]);

    const options = useMemo(() => {
        const filteredOptions = filterAndOrderOptions(defaultOptions, debouncedSearchValue.trim(), countryCode, {
            excludeLogins: {...CONST.EXPENSIFY_EMAILS_OBJECT, ...existingDelegates},
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        const headerMessage = getHeaderMessage(
            (filteredOptions.recentReports?.length || 0) + (filteredOptions.personalDetails?.length || 0) !== 0,
            !!filteredOptions.userToInvite,
            debouncedSearchValue,
        );

        return {
            ...filteredOptions,
            headerMessage,
        };
    }, [debouncedSearchValue, defaultOptions, existingDelegates, countryCode]);

    return {...options, searchValue, debouncedSearchValue, setSearchValue, areOptionsInitialized};
}
function AddDelegatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const {userToInvite, recentReports, personalDetails, searchValue, debouncedSearchValue, setSearchValue, headerMessage, areOptionsInitialized} = useOptions();
    const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);

    const sections = useMemo(() => {
        const sectionsList = [];

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
                text: option.text ?? '',
                alternateText: option.alternateText ?? undefined,
                keyForList: option.keyForList ?? '',
                isDisabled: option.isDisabled ?? undefined,
                login: option.login ?? undefined,
                shouldShowSubscript: option.shouldShowSubscript ?? undefined,
                isSelected: option.login === selectedOption,
            })),
        }));
    }, [personalDetails, recentReports, translate, userToInvite, selectedOption]);

    const onSelectRow = useCallback((option: Participant) => {
        setSelectedOption(option?.login);
        Navigation.navigate(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(option?.login ?? ''));
    }, []);

    useEffect(() => {
        searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={AddDelegatePage.displayName}
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('delegate.addCopilot')}
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
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

AddDelegatePage.displayName = 'AddDelegatePage';

export default AddDelegatePage;
