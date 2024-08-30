import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Tag from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type TagApproverPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_APPROVER>;

function TagApproverPage({route}: TagApproverPageProps) {
    const {policyID, orderWeight, tagName} = route.params;

    const policy = usePolicy(policyID);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tagApprover = PolicyUtils.getTagExpenseRule(policyID, tagName)?.approver;

    console.log('POLICY ', policy);
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
