import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';

import {searchUserInServer} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useEffect} from 'react';
import {View} from 'react-native';

function AddDelegatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const existingDelegates =
        account?.delegatedAccess?.delegates?.reduce(
            (prev, {email}) => {
                // eslint-disable-next-line no-param-reassign
                prev[email] = true;
                return prev;
            },
            {} as Record<string, boolean>,
        ) ?? {};

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedNonExistingOptions, areOptionsInitialized, toggleSelection} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        includeUserToInvite: true,
        excludeLogins: {...CONST.EXPENSIFY_EMAILS_OBJECT, ...existingDelegates},
        includeRecentReports: true,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        shouldKeepSelectedInAvailableOptions: true,
        shouldUpdateSelectedOptionsOnSingleSelect: true,
    });

    const handleSelectRow = (option: OptionData) => {
        // toggleSelection would deselect an already-selected row on re-tap, so only select when it isn't selected yet
        if (!option.isSelected) {
            toggleSelection(option);
        }
        Navigation.navigate(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(option.login ?? ''));
    };

    const sectionsList = (() => {
        const list = [];
        if (selectedNonExistingOptions.length > 0) {
            list.push({
                title: undefined,
                sectionIndex: 0,
                data: selectedNonExistingOptions,
            });
        }

        if (availableOptions.recentOptions?.length) {
            list.push({
                title: translate('common.recents'),
                sectionIndex: 1,
                data: availableOptions.recentOptions,
            });
        }

        if (availableOptions.personalDetails?.length) {
            list.push({
                title: translate('common.contacts'),
                sectionIndex: 2,
                data: availableOptions.personalDetails,
            });
        }

        if (availableOptions.userToInvite) {
            list.push({
                sectionIndex: 3,
                title: '',
                data: [availableOptions.userToInvite],
            });
        }

        return list;
    })();

    const sections = sectionsList.map((section) => ({
        ...section,
        data: section.data.map((option, index) => ({
            ...option,
            text: option.text ?? '',
            alternateText: option.alternateText ?? undefined,
            keyForList: `${option.keyForList}-${index}`,
            isDisabled: option.isDisabled ?? undefined,
            login: option.login ?? undefined,
            shouldShowSubscript: undefined,
        })),
    }));

    const searchValue = debouncedSearchTerm.trim().toLowerCase();
    const headerMessage = (() => {
        if (sections.length > 0) {
            return '';
        }
        return getHeaderMessage(translate, searchValue, countryCode);
    })();

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
                        onSelectRow={handleSelectRow}
                        shouldSingleExecuteRowSelect
                        textInputOptions={{
                            value: searchTerm,
                            onChangeText: setSearchTerm,
                            headerMessage,
                            label: translate('selectionList.nameEmailOrPhoneNumber'),
                        }}
                        shouldShowLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                        shouldShowTextInput
                    />
                </View>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export default AddDelegatePage;
