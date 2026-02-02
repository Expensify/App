import {adminAccountIDsSelector, domainNameSelector, selectSecurityGroupForAccount} from '@selectors/Domain';
import {personalDetailsSelector} from '@selectors/PersonalDetails';
import React, {useState} from 'react';
import Button from '@components/Button';
import DecisionModal from '@components/DecisionModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {closeUserAccount} from '@libs/actions/Domain';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainMemberDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

function DomainMemberDetailsPage({route}: DomainMemberDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['RemoveMembers']);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [shouldForceCloseAccount, setShouldForceCloseAccount] = useState<boolean>();
    // we need to use isSmallScreenWidth here because the DecisionModal is opening from RHP and ShouldUseNarrowLayout layout will not work in this place
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {showConfirmModal} = useConfirmModal();

    const [adminAccountIDs, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });

    const [userSecurityGroup] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: selectSecurityGroupForAccount(accountID),
    });

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: personalDetailsSelector(accountID),
    });

    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: false, selector: domainNameSelector});

    const memberLogin = personalDetails?.login ?? '';

    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isAdmin = adminAccountIDs?.includes(currentUserAccountID);

    const handleCloseAccount = async () => {
        if (!userSecurityGroup || shouldForceCloseAccount === undefined) {
            return;
        }

        const result = await showConfirmModal({
            title: translate('domain.members.closeAccount'),
            prompt: translate('domain.members.closeAccountPrompt'),
            confirmText: translate('domain.members.closeAccount'),
            cancelText: translate('common.cancel'),
            danger: true,
            shouldShowCancelButton: true,
        });
        if (result.action !== ModalActions.CONFIRM) {
            setIsModalVisible(true);
            setShouldForceCloseAccount(undefined);
            return;
        }
        closeUserAccount(domainAccountID, domainName ?? '', accountID, memberLogin, userSecurityGroup, shouldForceCloseAccount);
        setShouldForceCloseAccount(undefined);
        Navigation.dismissModal();
    };

    const handleForceCloseAccount = () => {
        setShouldForceCloseAccount(true);
        setIsModalVisible(false);
    };

    const handleSafeCloseAccount = () => {
        setShouldForceCloseAccount(false);
        setIsModalVisible(false);
    };

    const avatarButton = (
        <Button
            text={translate('domain.members.closeAccount')}
            onPress={() => setIsModalVisible(true)}
            isDisabled={!isAdmin}
            icon={icons.RemoveMembers}
            style={styles.mb5}
        />
    );

    if (isLoadingOnyxValue(domainMetadata)) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <>
            <BaseDomainMemberDetailsComponent
                domainAccountID={domainAccountID}
                accountID={accountID}
                avatarButton={avatarButton}
            />
            <DecisionModal
                title={translate('domain.members.closeAccount')}
                prompt={translate('domain.members.closeAccountInfo')}
                isSmallScreenWidth={isSmallScreenWidth}
                onFirstOptionSubmit={handleForceCloseAccount}
                onSecondOptionSubmit={handleSafeCloseAccount}
                secondOptionText={translate('domain.members.safeCloseAccount')}
                firstOptionText={translate('domain.members.forceCloseAccount')}
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onModalHide={() => {
                    handleCloseAccount();
                }}
                isFirstOptionDanger
                isSecondOptionSuccess
            />
        </>
    );
}

export default DomainMemberDetailsPage;
