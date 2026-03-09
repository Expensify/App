import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
// eslint-disable-next-line no-restricted-imports -- SelectionListWithSections required for section-based user list display
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftValues} from '@libs/actions/FormActions';
import {searchInServer} from '@libs/actions/Report';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {generateAccountID} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceConfirmationForm';
import type {Participant} from '@src/types/onyx/IOU';

/**
 * Helper function to create a formatted user list item
 */
function createUserListItem(personalDetails: ReturnType<typeof getPersonalDetailByEmail>, login: string, keyPrefix: string, isSelected = false) {
    const accountID = personalDetails?.accountID ?? generateAccountID(login);
    return {
        ...(personalDetails ?? {}),
        text: personalDetails?.displayName ?? login,
        alternateText: personalDetails?.login ?? login,
        login: personalDetails?.login ?? login,
        keyForList: `${keyPrefix}-${personalDetails?.login ?? login}`,
        accountID,
        isSelected,
        shouldShowSubscript: undefined,
        icons: [
            {
                source: personalDetails?.avatar ?? FallbackAvatar,
                name: formatPhoneNumber(personalDetails?.login ?? login),
                type: CONST.ICON_TYPE_AVATAR,
                id: accountID,
            },
        ],
    };
}

function WorkspaceConfirmationOwnerSelectorPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT);
    const currentOwner = draftValues?.owner ?? currentUserLogin ?? '';
    const ownerPersonalDetails = getPersonalDetailByEmail(currentOwner);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.OWNER_SELECTOR.path);

    const excludeLogins = useMemo(
        () => ({
            ...CONST.EXPENSIFY_EMAILS_OBJECT,
        }),
        [],
    );

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        excludeLogins,
        includeRecentReports: true,
        getValidOptionsConfig: {
            excludeLogins,
        },
    });

    const headerMessage = useMemo(() => {
        return getHeaderMessage(
            (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
            !!availableOptions.userToInvite,
            debouncedSearchTerm.trim(),
            countryCode,
            false,
        );
    }, [availableOptions.recentReports?.length, availableOptions.personalDetails?.length, availableOptions.userToInvite, debouncedSearchTerm, countryCode]);

    const sections = useMemo(() => {
        const sectionsList = [];
        const currentUserPersonalDetails = getPersonalDetailByEmail(currentUserLogin ?? '');

        if (currentOwner) {
            const ownerItem = createUserListItem(ownerPersonalDetails, currentOwner, 'currentOwner', true);
            sectionsList.push({
                title: undefined,
                data: [ownerItem],
                shouldShow: true,
            });
        }

        if (currentUserLogin && currentUserLogin !== currentOwner) {
            const currentUserItem = createUserListItem(currentUserPersonalDetails, currentUserLogin, 'currentUser', false);
            sectionsList.push({
                title: undefined,
                data: [currentUserItem],
                shouldShow: true,
            });
        }

        const filteredRecentReports = availableOptions.recentReports?.filter((report) => report.login !== currentOwner) ?? [];
        if (filteredRecentReports.length > 0) {
            sectionsList.push({
                title: translate('common.recents'),
                data: filteredRecentReports,
                shouldShow: true,
            });
        }

        const filteredPersonalDetails = availableOptions.personalDetails?.filter((contact) => contact.login !== currentOwner) ?? [];
        if (filteredPersonalDetails.length > 0) {
            sectionsList.push({
                title: translate('common.contacts'),
                data: filteredPersonalDetails,
                shouldShow: true,
            });
        }

        if (availableOptions.userToInvite && availableOptions.userToInvite.login !== currentOwner) {
            sectionsList.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                shouldShow: true,
            });
        }

        return sectionsList;
    }, [currentOwner, currentUserLogin, ownerPersonalDetails, translate, availableOptions.recentReports, availableOptions.personalDetails, availableOptions.userToInvite]);

    const onSelectRow = useCallback(
        (option: Participant) => {
            // Clear search to prevent "No results found" after selection
            setSearchTerm('');

            setDraftValues(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM, {
                [INPUT_IDS.OWNER]: option?.login,
            });

            // Navigate back to the confirmation form
            Navigation.goBack(backPath);
        },
        [setSearchTerm, backPath],
    );

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="WorkspaceConfirmationOwnerSelectorPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.common.workspaceOwner')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
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
                    onEndReached={onListEndReached}
                />
            </View>
        </ScreenWrapper>
    );
}

export default WorkspaceConfirmationOwnerSelectorPage;
