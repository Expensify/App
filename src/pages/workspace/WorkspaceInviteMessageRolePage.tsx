import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {setWorkspaceInviteRoleDraft} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type ListItemType = {
    value: ValueOf<typeof CONST.POLICY.ROLE>;
    text: string;
    alternateText: string;
    isSelected: boolean;
    keyForList: ValueOf<typeof CONST.POLICY.ROLE>;
};

type WorkspaceInviteMessageRolePageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE_MESSAGE_ROLE>;

function WorkspaceInviteMessageRolePage({policy, route}: WorkspaceInviteMessageRolePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [role = CONST.POLICY.ROLE.USER, roleResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT}${route.params.policyID}`, {
        canBeMissing: true,
    });
    const viewportOffsetTop = useViewportOffsetTop();
    const isOnyxLoading = isLoadingOnyxValue(roleResult);

    const roleItems: ListItemType[] = useMemo(
        () => [
            {
                value: CONST.POLICY.ROLE.ADMIN,
                text: translate('common.admin'),
                alternateText: translate('workspace.common.adminAlternateText'),
                isSelected: role === CONST.POLICY.ROLE.ADMIN,
                keyForList: CONST.POLICY.ROLE.ADMIN,
            },
            {
                value: CONST.POLICY.ROLE.AUDITOR,
                text: translate('common.auditor'),
                alternateText: translate('workspace.common.auditorAlternateText'),
                isSelected: role === CONST.POLICY.ROLE.AUDITOR,
                keyForList: CONST.POLICY.ROLE.AUDITOR,
            },
            {
                value: CONST.POLICY.ROLE.USER,
                text: translate('common.member'),
                alternateText: translate('workspace.common.memberAlternateText'),
                isSelected: role === CONST.POLICY.ROLE.USER,
                keyForList: CONST.POLICY.ROLE.USER,
            },
        ],
        [role, translate],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                testID={WorkspaceInviteMessageRolePage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                style={{marginTop: viewportOffsetTop}}
            >
                <HeaderWithBackButton
                    title={translate('common.role')}
                    onBackButtonPress={() => Navigation.goBack(route.params.backTo)}
                />
                {!isOnyxLoading && (
                    <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                        <SelectionList
                            sections={[{data: roleItems}]}
                            ListItem={RadioListItem}
                            onSelectRow={({value}: ListItemType) => {
                                setWorkspaceInviteRoleDraft(route.params.policyID, value);
                                Navigation.setNavigationActionToMicrotaskQueue(() => {
                                    Navigation.goBack(route.params.backTo);
                                });
                            }}
                            isAlternateTextMultilineSupported
                            shouldSingleExecuteRowSelect
                            initiallyFocusedOptionKey={roleItems.find((item) => item.isSelected)?.keyForList}
                            addBottomSafeAreaPadding
                        />
                    </View>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInviteMessageRolePage.displayName = 'WorkspaceInviteMessageRolePage';
export default withPolicyAndFullscreenLoading(WorkspaceInviteMessageRolePage);
