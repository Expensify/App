import React, {useCallback} from 'react';
import {adminAccountIDsSelector, technicalContactSettingsSelector} from '@selectors/Domain';
import Badge from '@components/Badge';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import {getCurrentUserAccountID} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainAdminsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS>;

function DomainAdminsPage({route}: DomainAdminsPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['Members']);
    const icons = useMemoizedLazyExpensifyIcons(['Gear']);

    const [adminAccountIDs, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    const [technicalContactSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
        selector: technicalContactSettingsSelector,
    });

    const currentUserAccountID = getCurrentUserAccountID();
    const isAdmin = adminAccountIDs?.includes(currentUserAccountID);

    const data: AdminOption[] = [];
    for (const accountID of adminAccountIDs ?? []) {
        const details = personalDetails?.[accountID];
        const isPrimaryContact = technicalContactSettings?.technicalContactEmail === details?.login;
        data.push({
            keyForList: String(accountID),
            accountID,
            login: details?.login ?? '',
            text: formatPhoneNumber(getDisplayNameOrDefault(details)),
            alternateText: formatPhoneNumber(details?.login ?? ''),
            icons: [
                {
                    source: details?.avatar ?? icons.FallbackAvatar,
                    name: formatPhoneNumber(details?.login ?? ''),
                    type: CONST.ICON_TYPE_AVATAR,
                    id: accountID,
                },
            ],
            rightElement: isPrimaryContact && <Badge text={translate('domain.admins.primaryContact')} />,
        });
    }

    const filterMember = (adminOption: AdminOption, searchQuery: string) => {
        const results = tokenizedSearch([adminOption], searchQuery, (option) => [option.text ?? '', option.alternateText ?? '']);
        return results.length > 0;
    };
    const sortMembers = (adminOptions: AdminOption[]) => sortAlphabetically(adminOptions, 'text', localeCompare);
    const [inputValue, setInputValue, filteredData] = useSearchResults(data, filterMember, sortMembers);

    const getCustomListHeader = () => {
        if (filteredData.length === 0) {
            return null;
        }

        return (
            <CustomListHeader
                canSelectMultiple={false}
                leftHeaderText={translate('domain.admins.title')}
            />
        );
    };
    const getCustomRightElement = useCallback(
        (accountID: number) => {
            const login = personalDetails?.[accountID]?.login;
            if (technicalContactEmail !== login) {
                return null;
            }
            return <Badge text={translate('domain.admins.primaryContact')} />;
        },
        [personalDetails, technicalContactEmail, translate],
    );

    const headerContent = isAdmin ? (
        <Button
            onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(domainAccountID))}
            text={translate('domain.admins.settings')}
            icon={icons.Gear}
            innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
            style={shouldUseNarrowLayout ? [styles.flexGrow1, styles.mb3] : undefined}
        />
    ) : null;

    return (
        <BaseDomainMembersPage
            domainAccountID={domainAccountID}
            accountIDs={adminAccountIDs ?? []}
            headerTitle={translate('domain.admins.title')}
            searchPlaceholder={translate('domain.admins.findAdmin')}
            headerIcon={illustrations.Members}
            headerContent={headerContent}
            getCustomRightElement={getCustomRightElement}
            onSelectRow={(item) => Navigation.navigate(ROUTES.DOMAIN_ADMIN_DETAILS.getRoute(domainAccountID, item.accountID))}
            isLoading={isLoadingOnyxValue(domainMetadata)}
        />
    );
}

DomainAdminsPage.displayName = 'DomainAdminsPage';

export default DomainAdminsPage;
