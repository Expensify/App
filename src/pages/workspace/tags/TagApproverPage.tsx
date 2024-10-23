import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Tag from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type TagApproverPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_APPROVER>;

function TagApproverPage({route}: TagApproverPageProps) {
    const {policyID, tagName, orderWeight, backTo} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tagApprover = PolicyUtils.getTagApproverRule(policyID, tagName)?.approver;
    const isQuickSettingsFlow = !!backTo;

    const goBack = () => {
        Navigation.goBack(
            isQuickSettingsFlow ? ROUTES.SETTINGS_TAG_SETTINGS.getRoute(policyID, orderWeight, tagName, backTo) : ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(policyID, orderWeight, tagName),
        );
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={TagApproverPage.displayName}
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
                        Tag.setPolicyTagApprover(policyID, tagName, email);
                        Navigation.setNavigationActionToMicrotaskQueue(goBack);
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

TagApproverPage.displayName = 'TagApproverPage';

export default TagApproverPage;
