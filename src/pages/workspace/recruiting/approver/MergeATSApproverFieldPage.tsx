import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMergeConnected} from '@libs/merge/MergeUtils';
import {getConnectedATSProvider} from '@libs/merge/RecruitingUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeATSApprovalNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {getApproverFieldName} from '@pages/workspace/recruiting/utils';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {MergeATSApproverField} from '@src/types/onyx/Policy';
import ObjectUtils from '@src/types/utils/ObjectUtils';

import React from 'react';
import {View} from 'react-native';

import {useMergeATSApprovalDraftActions, useMergeATSApprovalDraftState} from './MergeATSApprovalDraftContext';

type MergeATSApproverFieldPageProps = PlatformStackScreenProps<MergeATSApprovalNavigatorParamList, typeof SCREENS.WORKSPACE.RECRUITING_MERGE_APPROVER_FIELD>;

type ApproverFieldListItem = ListItem & {
    value: MergeATSApproverField;
};

function MergeATSApproverFieldPage({
    route: {
        params: {policyID},
    },
}: MergeATSApproverFieldPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);

    const providerName = getConnectedATSProvider(policy)?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_ats;
    const {approverField: currentApproverField} = useMergeATSApprovalDraftState();
    const {setDraftApproverField} = useMergeATSApprovalDraftActions();

    const approverFieldOptions: ApproverFieldListItem[] = ObjectUtils.typedKeys(CONST.MERGE.ATS_APPROVER_FIELD).map((key) => {
        const value = CONST.MERGE.ATS_APPROVER_FIELD[key];

        return {
            text: getApproverFieldName(value, translate),
            keyForList: value,
            value,
            isSelected: currentApproverField === value,
        };
    });

    const selectApproverField = (approverField: MergeATSApproverField) => {
        setDraftApproverField(approverField);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.MERGE_ATS) || (!!policy && !isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="MergeATSApproverFieldPage"
            >
                <HeaderWithBackButton title={translate('workspace.recruiting.approverField')} />
                <View style={styles.flex1}>
                    <Text style={[styles.textSupporting, styles.ph5, styles.mb3]}>{translate('workspace.recruiting.approverFieldDescription', providerName)}</Text>
                    <SelectionList
                        data={approverFieldOptions}
                        ListItem={SingleSelectListItem}
                        onSelectRow={(option) => selectApproverField(option.value)}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={currentApproverField}
                        addBottomSafeAreaPadding
                        showScrollIndicator={false}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default MergeATSApproverFieldPage;
