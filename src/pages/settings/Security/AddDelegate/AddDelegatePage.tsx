import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchUserInServer} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getUrlWithParams} from '@libs/Url';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {areSameDelegateOption, buildAddDelegateSections, buildInitialDelegateOption} from './AddDelegatePageUtils';

type AddDelegatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.ADD_DELEGATE>;

function AddDelegatePage({route}: AddDelegatePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const selectedDelegateLogin = route.params?.login;
    const existingDelegates =
        account?.delegatedAccess?.delegates?.reduce(
            (prev, {email}) => {
                // eslint-disable-next-line no-param-reassign
                prev[email] = true;
                return prev;
            },
            {} as Record<string, boolean>,
        ) ?? {};
    const initiallySelectedOptions = useMemo(() => buildInitialDelegateOption(selectedDelegateLogin, personalDetails), [personalDetails, selectedDelegateLogin]);

    const {searchTerm, debouncedSearchTerm, setSearchTerm, searchOptions, selectedOptions, areOptionsInitialized, toggleSelection, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        includeUserToInvite: true,
        excludeLogins: {...CONST.EXPENSIFY_EMAILS_OBJECT, ...existingDelegates},
        includeRecentReports: true,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        initialSelected: initiallySelectedOptions,
        prioritizeSelectedOnToggle: false,
        onSingleSelect: (option) => {
            const login = option.login ?? '';
            if (!login) {
                return;
            }

            Navigation.navigate(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(login, undefined, getUrlWithParams(ROUTES.SETTINGS_ADD_DELEGATE, {login})));
        },
    });

    const sections: Array<Section<OptionData>> = useMemo(
        () =>
            buildAddDelegateSections({
                searchTerm: debouncedSearchTerm,
                searchOptions,
                selectedOptions,
                initialSelectedOptions: initiallySelectedOptions,
                areOptionsInitialized,
                translate,
            }).map((section, sectionIndex) => ({
                ...section,
                sectionIndex,
                data: section.data.map((option) => ({
                    ...option,
                    text: option.text ?? '',
                    alternateText: option.alternateText ?? undefined,
                    keyForList: option.keyForList?.toString() ?? option.login ?? option.accountID?.toString() ?? option.text ?? '',
                    isDisabled: option.isDisabled ?? undefined,
                    login: option.login ?? undefined,
                    shouldShowSubscript: option.shouldShowSubscript ?? undefined,
                })),
            })),
        [areOptionsInitialized, debouncedSearchTerm, initiallySelectedOptions, searchOptions, selectedOptions, translate],
    );

    const hasVisibleOptions = sections.some((section) => section.data.length > 0);
    const visibleUserToInvite =
        !!searchOptions.userToInvite && sections.some((section) => section.data.some((option) => areSameDelegateOption(option, searchOptions.userToInvite ?? undefined)));
    const headerMessage = getHeaderMessage(hasVisibleOptions, visibleUserToInvite, debouncedSearchTerm, countryCode);

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="AddDelegatePage"
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('delegate.addCopilot')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionListWithSections
                        sections={areOptionsInitialized ? sections : []}
                        ListItem={UserListItem}
                        onSelectRow={toggleSelection}
                        shouldSingleExecuteRowSelect
                        shouldScrollToTopOnSelect={false}
                        textInputOptions={{
                            value: searchTerm,
                            onChangeText: setSearchTerm,
                            headerMessage,
                            label: translate('selectionList.nameEmailOrPhoneNumber'),
                        }}
                        shouldShowLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                        shouldShowTextInput
                        onEndReached={onListEndReached}
                    />
                </View>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export {AddDelegatePage};
export default AddDelegatePage;
