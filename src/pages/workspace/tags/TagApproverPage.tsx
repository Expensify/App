import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Tag from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type TagApproverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_APPROVER>;

function TagApproverPage({route}: TagApproverPageProps) {
    const {policyID, tagName} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tagApprover = PolicyUtils.getTagApproverRule(policyID, tagName)?.approver;

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
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <WorkspaceMembersSelectionList
                    policyID={policyID}
                    selectedApprover={tagApprover ?? ''}
                    setApprover={(email) => {
                        Tag.setPolicyTagApprover(policyID, tagName, email);
                        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

TagApproverPage.displayName = 'TagApproverPage';

export default TagApproverPage;
