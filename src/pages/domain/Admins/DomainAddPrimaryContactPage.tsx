import {adminAccountIDsSelector, adminPendingActionSelector, technicalContactSettingsSelector} from '@selectors/Domain';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {setPrimaryContact} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

type AdminOption = Omit<ListItem, 'accountID' | 'login'> & {
    accountID: number;
    login: string;
};
type DomainAddPrimaryContactPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADD_PRIMARY_CONTACT>;

function DomainAddPrimaryContactPage({route}: DomainAddPrimaryContactPageProps) {
    const {domainAccountID} = route.params;
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const [adminAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });
    const [adminPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminPendingActionSelector,
    });
    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
            if (!personalDetailsList) {
                return undefined;
            }

            const adminsPersonalDetails: OnyxEntry<PersonalDetailsList> = {};
            for (const accountID of adminAccountIDs ?? []) {
                adminsPersonalDetails[`${accountID}`] = personalDetailsList[accountID];
            }

            return adminsPersonalDetails;
        },
    });
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [technicalContactSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
        selector: technicalContactSettingsSelector,
    });
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {canBeMissing: true});

    let technicalContactEmailKey: string | undefined;
    const data: AdminOption[] = [];
    for (const accountID of adminAccountIDs ?? []) {
        // Don't show admins with errors
        const adminErrors = domainErrors?.adminErrors?.[accountID] ?? {};
        if (Object.keys(adminErrors).length !== 0) {
            continue;
        }

        // Don't show admins being deleted
        const adminPendingAction = adminPendingActions?.[accountID]?.pendingAction;
        if (adminPendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }

        const details = personalDetails?.[accountID];
        let isSelected = false;
        if (!!details?.login && !!technicalContactSettings?.technicalContactEmail && details.login === technicalContactSettings.technicalContactEmail) {
            technicalContactEmailKey = String(accountID);
            isSelected = true;
        }
        data.push({
            isSelected,
            keyForList: String(accountID),
            accountID,
            login: details?.login ?? '',
            text: formatPhoneNumber(getDisplayNameOrDefault(details)),
            alternateText: formatPhoneNumber(details?.login ?? ''),
            icons: [
                {
                    source: details?.avatar ?? details?.fallbackIcon ?? '',
                    name: formatPhoneNumber(details?.login ?? ''),
                    type: CONST.ICON_TYPE_AVATAR,
                    id: accountID,
                },
            ],
        });
    }

    const filteredApprovers =
        debouncedSearchTerm !== '' ? tokenizedSearch(data, getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode), (option) => [option.text ?? '', option.login ?? '']) : data;
    const filteredData = sortAlphabetically(filteredApprovers, 'text', localeCompare);

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                testID={DomainAddPrimaryContactPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('domain.admins.addPrimaryContact')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(domainAccountID))}
                />
                <SelectionList
                    data={filteredData}
                    onSelectRow={(option) => {
                        if (!option.login || !option.accountID) {
                            return;
                        }
                        if (option.login !== technicalContactSettings?.technicalContactEmail) {
                            setPrimaryContact(domainAccountID, option.login, technicalContactSettings?.technicalContactEmail);
                        }
                        Navigation.goBack(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(domainAccountID));
                    }}
                    ListItem={InviteMemberListItem}
                    canSelectMultiple={false}
                    initiallyFocusedItemKey={technicalContactEmailKey}
                    shouldScrollToFocusedIndex
                    shouldShowTextInput
                    textInputOptions={{
                        label: translate('selectionList.findMember'),
                        value: searchTerm,
                        onChangeText: setSearchTerm,
                        headerMessage: searchTerm && !filteredData?.length ? translate('common.noResultsFound') : '',
                    }}
                    addBottomSafeAreaPadding
                    showScrollIndicator
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainAddPrimaryContactPage.displayName = 'DomainAddPrimaryContactPage';

export default DomainAddPrimaryContactPage;
