import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyTagApprover} from '@libs/actions/Policy/Tag';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getTagApproverRule} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type DynamicTagApproverPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_TAG_APPROVER>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_APPROVER>;

function DynamicTagApproverPage({route}: DynamicTagApproverPageProps) {
    const {policyID, tagName} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);

    const tagApprover = getTagApproverRule(policy, tagName)?.approver;
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_APPROVER;
    const backPath = useDynamicBackPath(isQuickSettingsFlow ? DYNAMIC_ROUTES.SETTINGS_TAG_APPROVER.path : DYNAMIC_ROUTES.WORKSPACE_TAG_APPROVER.path);

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicTagApproverPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.tags.approverDescription')}
                    onBackButtonPress={goBack}
                />
                <WorkspaceMembersSelectionList
                    policyID={policyID}
                    selectedApprover={tagApprover ?? ''}
                    setApprover={(email) => {
                        setPolicyTagApprover(policy, tagName, email);
                        Navigation.setNavigationActionToMicrotaskQueue(goBack);
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicTagApproverPage;
