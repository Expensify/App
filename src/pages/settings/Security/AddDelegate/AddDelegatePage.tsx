import React, {useEffect} from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionList from '@components/SelectionList/SelectionListWithSections';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function AddDelegatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const existingDelegates =
        account?.delegatedAccess?.delegates?.reduce(
            (prev, {email}) => {
                // eslint-disable-next-line no-param-reassign
                prev[email] = true;
                return prev;
            },
            {} as Record<string, boolean>,
        ) ?? {};

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized, toggleSelection} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        includeUserToInvite: true,
        excludeLogins: {...CONST.EXPENSIFY_EMAILS_OBJECT, ...existingDelegates},
        includeRecentReports: true,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        onSingleSelect: (option) => {
            Navigation.navigate(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(option.login ?? ''));
        },
    });

    const headerMessage = getHeaderMessage(
        (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
        !!availableOptions.userToInvite,
        debouncedSearchTerm,
        countryCode,
    );
    const sectionsList: Array<{title?: string; data: typeof availableOptions.recentReports}> = [
        {
            title: translate('common.recents'),
            data: availableOptions.recentReports,
        },
        {
            title: translate('common.contacts'),
            data: availableOptions.personalDetails,
        },
    ];

    if (availableOptions.userToInvite) {
        sectionsList.push({
            data: [availableOptions.userToInvite],
        });
    }

    const sections = sectionsList.map((section) => ({
        ...section,
        data: section.data.map((option, index) => ({
            ...option,
            text: option.text ?? '',
            alternateText: option.alternateText ?? undefined,
            keyForList: `${option.keyForList}-${index}`,
            isDisabled: option.isDisabled ?? undefined,
            login: option.login ?? undefined,
            shouldShowSubscript: option.shouldShowSubscript ?? undefined,
        })),
    }));

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
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
                    <SelectionList
                        sections={areOptionsInitialized ? sections : []}
                        ListItem={UserListItem}
                        onSelectRow={toggleSelection}
                        shouldSingleExecuteRowSelect
                        textInputOptions={{
                            value: searchTerm,
                            onChangeText: setSearchTerm,
                            headerMessage,
                            label: translate('selectionList.nameEmailOrPhoneNumber'),
                        }}
                        showLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                        disableMaintainingScrollPosition
                        shouldShowTextInput
                    />
                </View>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export default AddDelegatePage;
