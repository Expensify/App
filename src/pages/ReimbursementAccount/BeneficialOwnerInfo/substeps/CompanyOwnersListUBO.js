import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import * as ErrorUtils from '@libs/ErrorUtils';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const beneficialOwnerInfoStepKeys = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.INPUT_KEY;

function CompanyOwnersListUBO({reimbursementAccount, reimbursementAccountDraft}) {
    const {translate} = useLocalize();

    const values = useMemo(() => getSubstepValues(beneficialOwnerInfoStepKeys, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount);

    return (
        <ScreenWrapper
            testID={CompanyOwnersListUBO.displayName}
            style={[styles.pt0]}
            scrollEnabled
        >
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5]}>
                <Text style={[styles.textHeadline]}>{translate('beneficialOwnerInfoStep.letsDoubleCheck')}</Text>
                <Text style={styles.pv5}>{translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}</Text>
                <View>
                    <Text style={[styles.textLabelSupporting, styles.pv1]}>{`${translate('beneficialOwnerInfoStep.owners')}:`}</Text>
                    {/* TODO: map over UBO list here */}
                    <MenuItem
                        title="Shawn Borton"
                        description="1234 Atlantic Ave, Ocean City, NJ 08226"
                        icon={Expensicons.FallbackAvatar}
                        iconWidth={40}
                        iconHeight={40}
                        shouldShowRightIcon
                        wrapperStyle={[styles.ph0]}
                    />
                </View>

                <View style={[styles.ph5, styles.mtAuto]}>
                    {error.length > 0 && (
                        <DotIndicatorMessage
                            textStyles={[styles.formError]}
                            type="error"
                            messages={{0: error}}
                        />
                    )}
                    <Button
                        success
                        style={[styles.w100, styles.mt2, styles.pb5]}
                        onPress={() => {}} // TODO:
                        text={translate('common.confirm')}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

CompanyOwnersListUBO.propTypes = propTypes;
CompanyOwnersListUBO.defaultProps = defaultProps;
CompanyOwnersListUBO.displayName = 'CompanyOwnersListUBO';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(CompanyOwnersListUBO);
