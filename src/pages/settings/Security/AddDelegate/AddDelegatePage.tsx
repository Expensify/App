import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchUserInServer} from '@libs/actions/Report';
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
    const existingDelegates = useMemo(
        () =>
            account?.delegatedAccess?.delegates?.reduce(
                (prev, {email}) => {
                    // eslint-disable-next-line no-param-reassign
                    prev[email] = true;
                    return prev;
                },
                {} as Record<string, boolean>,
            ) ?? {},
        [account?.delegatedAccess?.delegates],
    );

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

    const headerMessage = useMemo(() => {
        return getHeaderMessage(
            (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
            !!availableOptions.userToInvite,
            debouncedSearchTerm,
            countryCode,
        );
    }, [availableOptions.recentReports?.length, availableOptions.personalDetails?.length, availableOptions.userToInvite, debouncedSearchTerm, countryCode]);

    const sections = useMemo(() => {
        const sectionsList = [];

        sectionsList.push({
            title: translate('common.recents'),
            data: availableOptions.recentReports,
            shouldShow: availableOptions.recentReports?.length > 0,
        });

        sectionsList.push({
            title: translate('common.contacts'),
            data: availableOptions.personalDetails,
            shouldShow: availableOptions.personalDetails?.length > 0,
        });

        if (availableOptions.userToInvite) {
            sectionsList.push({
                title: undefined,
                data: [availableOptions.userToInvite],
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
            })),
        }));
    }, [availableOptions.recentReports, availableOptions.personalDetails, availableOptions.userToInvite, translate]);

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
                    <SelectionList
                        sections={areOptionsInitialized ? sections : []}
                        ListItem={UserListItem}
                        onSelectRow={toggleSelection}
                        shouldSingleExecuteRowSelect
                        onChangeText={setSearchTerm}
                        textInputValue={searchTerm}
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

export default AddDelegatePage;
