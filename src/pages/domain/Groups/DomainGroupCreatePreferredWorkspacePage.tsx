import React, {useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {setDomainGroupCreatePreferredPolicyID} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

type WorkspaceListItem = {
    policyID: string;
} & ListItem;

const createAdminPolicySelector = (currentPolicyID: string | undefined) => (policies: OnyxCollection<Policy>) => {
    return Object.entries(policies ?? {}).reduce<Record<string, Pick<Policy, 'name' | 'id' | 'avatarURL'>>>((acc, [key, policy]) => {
        if (!policy?.id || !policy?.name) {
            return acc;
        }
        const isCurrentPolicy = policy.id === currentPolicyID;
        if (!isCurrentPolicy && (policy.type === CONST.POLICY.TYPE.PERSONAL || policy.role !== CONST.POLICY.ROLE.ADMIN)) {
            return acc;
        }
        acc[key] = {id: policy.id, name: policy.name, avatarURL: policy.avatarURL};
        return acc;
    }, {});
};

type DomainGroupCreatePreferredWorkspacePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.GROUP_CREATE_PREFERRED_WORKSPACE>;

function DomainGroupCreatePreferredWorkspacePage({route}: DomainGroupCreatePreferredWorkspacePageProps) {
    const {domainAccountID} = route.params;

    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackWorkspaceAvatar']);

    const [currentPolicyID] = useOnyx(ONYXKEYS.DOMAIN_GROUP_CREATE_PREFERRED_POLICY_ID);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createAdminPolicySelector(currentPolicyID)});
    const [selectedPolicyID, setSelectedPolicyID] = useState<string | undefined>(currentPolicyID);
    const [shouldShowError, setShouldShowError] = useState(false);

    const workspaceOptions: WorkspaceListItem[] = [];
    for (const policy of Object.values(policies ?? {})) {
        if (!policy?.name || !policy?.id) {
            continue;
        }

        workspaceOptions.push({
            text: policy.name,
            policyID: policy.id,
            keyForList: policy.id,
            isSelected: selectedPolicyID === policy.id,
            icons: [
                {
                    source: policy.avatarURL ?? getDefaultWorkspaceAvatar(policy.name),
                    fallbackIcon: icons.FallbackWorkspaceAvatar,
                    name: policy.name,
                    type: CONST.ICON_TYPE_WORKSPACE,
                    id: policy.id,
                },
            ],
        });
    }

    const handleSubmit = () => {
        if (!selectedPolicyID) {
            setShouldShowError(true);
            return;
        }
        setDomainGroupCreatePreferredPolicyID(selectedPolicyID);
        Navigation.goBack(ROUTES.DOMAIN_GROUP_CREATE.getRoute(domainAccountID));
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                testID="DomainGroupCreatePreferredWorkspacePage"
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton
                    title={translate('domain.groups.preferredWorkspace')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_GROUP_CREATE.getRoute(domainAccountID))}
                />
                <Text style={[styles.ph5, styles.mb3]}>{translate('domain.groups.preferredWorkspaceSelectDescription')}</Text>
                <SelectionList<WorkspaceListItem>
                    data={workspaceOptions.sort((a, b) => localeCompare(a.text ?? '', b.text ?? ''))}
                    ListItem={UserListItem}
                    onSelectRow={(item: WorkspaceListItem) => {
                        setSelectedPolicyID(item.policyID);
                        setShouldShowError(false);
                    }}
                    initiallyFocusedItemKey={currentPolicyID}
                    shouldUpdateFocusedIndex
                    footerContent={
                        <FormAlertWithSubmitButton
                            buttonText={translate('common.save')}
                            onSubmit={handleSubmit}
                            isAlertVisible={shouldShowError}
                            containerStyles={[!shouldShowError && styles.mt5]}
                            message={translate('common.error.pleaseSelectOne')}
                        />
                    }
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainGroupCreatePreferredWorkspacePage;
