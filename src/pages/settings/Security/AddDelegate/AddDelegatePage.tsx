import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
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
import type {Participant} from '@src/types/onyx/IOU';

function AddDelegatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

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

    const {searchTerm, setSearchTerm, availableOptions, areOptionsInitialized} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        includeUserToInvite: true,
        excludeLogins: {...CONST.EXPENSIFY_EMAILS_OBJECT, ...existingDelegates},
        includeRecentReports: true,
    });

    const headerMessage = useMemo(() => {
        return getHeaderMessage((availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0, !!availableOptions.userToInvite, searchTerm);
    }, [availableOptions, searchTerm]);

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
    }, [availableOptions, translate]);

    const onSelectRow = useCallback((option: Participant) => {
        Navigation.navigate(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(option?.login ?? ''));
    }, []);

    useEffect(() => {
        searchInServer(searchTerm);
    }, [searchTerm]);

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

AddDelegatePage.displayName = 'AddDelegatePage';

export default AddDelegatePage;
