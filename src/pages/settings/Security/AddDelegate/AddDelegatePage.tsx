import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useBetas} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActions from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import CONST from '@src/CONST';

function useOptions() {
    const betas = useBetas();
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {options: optionsList, areOptionsInitialized} = useOptionsList();

    const defaultOptions = useMemo(() => {
        const {recentReports, personalDetails, userToInvite, currentUserOption} = OptionsListUtils.getFilteredOptions(
            optionsList.reports,
            optionsList.personalDetails,
            betas,
            '',
            [],
            CONST.EXPENSIFY_EMAILS,
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
            false,
            0,
        );

        const headerMessage = OptionsListUtils.getHeaderMessage((recentReports?.length || 0) + (personalDetails?.length || 0) !== 0 || !!currentUserOption, !!userToInvite, '');

        if (isLoading) {
            setIsLoading(false);
        }

        return {
            userToInvite,
            recentReports,
            personalDetails,
            currentUserOption,
            headerMessage,
            categoryOptions: [],
            tagOptions: [],
            taxRatesOptions: [],
        };
    }, [optionsList.reports, optionsList.personalDetails, betas, isLoading]);

    const options = useMemo(() => {
        const filteredOptions = OptionsListUtils.filterOptions(defaultOptions, debouncedSearchValue.trim(), {
            excludeLogins: CONST.EXPENSIFY_EMAILS,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        const headerMessage = OptionsListUtils.getHeaderMessage(
            (filteredOptions.recentReports?.length || 0) + (filteredOptions.personalDetails?.length || 0) !== 0 || !!filteredOptions.currentUserOption,
            !!filteredOptions.userToInvite,
            debouncedSearchValue,
        );

        return {
            ...filteredOptions,
            headerMessage,
        };
    }, [debouncedSearchValue, defaultOptions]);

    return {...options, searchValue, debouncedSearchValue, setSearchValue, areOptionsInitialized};
}
function AddDelegatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {userToInvite, recentReports, personalDetails, searchValue, debouncedSearchValue, setSearchValue, headerMessage, areOptionsInitialized} = useOptions();

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
            })),
        }));
    }, [personalDetails, recentReports, translate]);

    useEffect(() => {
        ReportActions.searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={AddDelegatePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('delegate.addCopilot')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                <SelectionList
                    sections={areOptionsInitialized ? sections : []}
                    ListItem={UserListItem}
                    onSelectRow={() => {}}
                    shouldSingleExecuteRowSelect
                    onChangeText={setSearchValue}
                    textInputValue={searchValue}
                    headerMessage={headerMessage}
                    textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                    showLoadingPlaceholder={!areOptionsInitialized}
                    // isLoadingNewOptions={!!isSearchingForReports}
                />
            </View>
        </ScreenWrapper>
    );
}

AddDelegatePage.displayName = 'AddDelegatePage';

export default AddDelegatePage;
