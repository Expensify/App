import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
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
import memoize from '@libs/memoize';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'AddDelegatePage.getValidOptions'});

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};
function AddDelegatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const {login: currentLogin} = useCurrentUserPersonalDetails();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {options, areOptionsInitialized} = usePersonalDetailsOptionsList();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const existingDelegates = useMemo(
        () =>
            account?.delegatedAccess?.delegates?.reduce(
                (prev, {email}) => {
                    // eslint-disable-next-line no-param-reassign
                    prev[email] = true;
                    return prev;
                },
                {...CONST.EXPENSIFY_EMAILS_OBJECT} as Record<string, boolean>,
            ),
        [account?.delegatedAccess?.delegates],
    );

    const optionsList = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return memoizedGetValidOptions(options, currentLogin ?? '', {
            excludeLogins: existingDelegates,
            includeRecentReports: true,
            searchString: debouncedSearchValue,
            includeCurrentUser: false,
            includeUserToInvite: true,
        });
    }, [areOptionsInitialized, currentLogin, debouncedSearchValue, existingDelegates, options]);

    /**
     * Returns the sections needed for the OptionsSelector
     */
    const [sections, header] = useMemo(() => {
        const newSections = [];
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

        const headerMessage = newSections.length === 0 ? getHeaderMessage(translate, debouncedSearchValue.trim()) : '';

        return [newSections, headerMessage];
    }, [areOptionsInitialized, optionsList.userToInvite, optionsList.recentOptions, optionsList.personalDetails, translate, debouncedSearchValue]);

    const onSelectRow = useCallback((option: OptionData) => {
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
                        sections={sections}
                        ListItem={UserListItem}
                        onSelectRow={onSelectRow}
                        shouldSingleExecuteRowSelect
                        onChangeText={setSearchValue}
                        textInputValue={searchValue}
                        headerMessage={header}
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
