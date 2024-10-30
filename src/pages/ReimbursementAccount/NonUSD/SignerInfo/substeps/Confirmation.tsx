import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type ConfirmationProps = SubStepProps & {isSecondSigner: boolean};

const SINGER_INFO_STEP_KEYS = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const {
    SIGNER_FULL_NAME,
    SECOND_SIGNER_FULL_NAME,
    SIGNER_JOB_TITLE,
    SECOND_SIGNER_JOB_TITLE,
    SIGNER_DATE_OF_BIRTH,
    SECOND_SIGNER_DATE_OF_BIRTH,
    SIGNER_COPY_OF_ID,
    SECOND_SIGNER_COPY_OF_ID,
    SIGNER_ADDRESS_PROOF,
    SECOND_SIGNER_ADDRESS_PROOF,
    OWNS_MORE_THAN_25_PERCENT,
} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function Confirmation({onNext, onMove, isSecondSigner}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const isUserOwner = reimbursementAccount?.achData?.additionalData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const values = useMemo(() => getSubstepValues(SINGER_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const IDs = values[isSecondSigner ? SECOND_SIGNER_COPY_OF_ID : SIGNER_COPY_OF_ID];
    const proofs = values[isSecondSigner ? SECOND_SIGNER_ADDRESS_PROOF : SIGNER_ADDRESS_PROOF];

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('signerInfoStep.letsDoubleCheck')}</Text>
                    {!isUserOwner && (
                        <MenuItemWithTopDescription
                            description={translate('signerInfoStep.legalName')}
                            title={`${values[isSecondSigner ? SECOND_SIGNER_FULL_NAME : SIGNER_FULL_NAME]}`}
                            shouldShowRightIcon
                            onPress={() => {
                                onMove(0);
                            }}
                        />
                    )}
                    <MenuItemWithTopDescription
                        description={translate('signerInfoStep.jobTitle')}
                        title={values[isSecondSigner ? SECOND_SIGNER_JOB_TITLE : SIGNER_JOB_TITLE]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(1);
                        }}
                    />
                    {!isUserOwner && (
                        <MenuItemWithTopDescription
                            description={translate('common.dob')}
                            title={values[isSecondSigner ? SECOND_SIGNER_DATE_OF_BIRTH : SIGNER_DATE_OF_BIRTH]}
                            shouldShowRightIcon
                            onPress={() => {
                                onMove(2);
                            }}
                        />
                    )}
                    <MenuItemWithTopDescription
                        description={translate('signerInfoStep.id')}
                        title={IDs ? IDs.map((id) => id.name).join(', ') : ''}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(3);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('signerInfoStep.proofOf')}
                        title={proofs ? proofs.map((proof) => proof.name).join(', ') : ''}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(3);
                        }}
                    />
                    <View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
                        <Button
                            success
                            style={[styles.w100]}
                            onPress={onNext}
                            large
                            text={translate('common.confirm')}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
