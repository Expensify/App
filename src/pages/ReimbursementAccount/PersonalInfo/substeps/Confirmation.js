import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import subStepPropTypes from '../../subStepPropTypes';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import TextLink from '../../../../components/TextLink';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import Button from '../../../../components/Button';
import ScreenWrapper from '../../../../components/ScreenWrapper';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
};

function Confirmation(props) {
    const {translate} = useLocalize();

    const defaultValues = {
        firstName: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME], ''),
        lastName: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME], ''),
        dob: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB], ''),
        ssnLast4: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4], ''),
        street: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET], ''),
        city: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY], ''),
        state: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE], ''),
        zipCode: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE], ''),
    };
    const handleConfirmPress = () => {
        // TODO API.write
        props.onNext();
    };

    return (
        <ScreenWrapper testID={Confirmation.displayName}>
            <Text style={[styles.textHeadline, styles.ph5, styles.mb8]}>{translate('personalInfoStep.letsDoubleCheck')}</Text>
            <MenuItemWithTopDescription
                description={translate('personalInfoStep.legalName')}
                title={`${defaultValues.firstName} ${defaultValues.lastName}`}
                shouldShowRightIcon
                onPress={() => {
                    // TODO Navigate legalName
                }}
            />
            <MenuItemWithTopDescription
                description={translate('common.dob')}
                title={defaultValues.dob}
                shouldShowRightIcon
                onPress={() => {
                    // TODO Navigate dob
                }}
            />
            <MenuItemWithTopDescription
                description={translate('personalInfoStep.last4SSN')}
                title={defaultValues.ssnLast4}
                shouldShowRightIcon
                onPress={() => {
                    // TODO Navigate last4
                }}
            />
            <MenuItemWithTopDescription
                description={translate('personalInfoStep.address')}
                title={`${defaultValues.street}, ${defaultValues.city}, ${defaultValues.state} ${defaultValues.zipCode}`}
                shouldShowRightIcon
                onPress={() => {
                    // TODO Navigate address
                }}
            />

            <Text style={[styles.mt3, styles.ph5, styles.textMicroSupporting]}>
                {`${translate('personalInfoStep.byAddingThisBankAccount')} `}
                <TextLink
                    href={CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}
                    style={[styles.textMicro]}
                >
                    {translate('onfidoStep.facialScan')}
                </TextLink>
                {', '}
                <TextLink
                    href={CONST.ONFIDO_PRIVACY_POLICY_URL}
                    style={[styles.textMicro]}
                >
                    {translate('common.privacy')}
                </TextLink>
                {` ${translate('common.and')} `}
                <TextLink
                    href={CONST.ONFIDO_TERMS_OF_SERVICE_URL}
                    style={[styles.textMicro]}
                >
                    {translate('common.termsOfService')}
                </TextLink>
            </Text>
            <Button
                success
                style={[styles.w100, styles.mtAuto, styles.ph5]}
                onPress={handleConfirmPress}
                text={translate('common.confirm')}
            />
        </ScreenWrapper>
    );
}

Confirmation.propTypes = propTypes;
Confirmation.displayName = 'Confirmation';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(Confirmation);
