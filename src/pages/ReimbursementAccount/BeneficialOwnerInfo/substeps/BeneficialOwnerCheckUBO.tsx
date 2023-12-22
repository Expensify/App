import React, {useMemo, useState} from 'react';
import FormProvider from '@components/Form/FormProvider';
import RadioButtons from '@components/RadioButtons';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type BeneficialOwnerCheckUBOProps = {
    title: string;
    defaultValue: boolean;
    onSelectedValue: (value: boolean) => void;
};

function BeneficialOwnerCheckUBO({title, onSelectedValue, defaultValue}: BeneficialOwnerCheckUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(defaultValue);

    const handleSelectUBOValue = () => {
        onSelectedValue(value);
    };

    const options = useMemo(
        () => [
            {
                label: translate('common.yes'),
                value: true,
            },
            {
                label: translate('common.no'),
                value: false,
            },
        ],
        [translate],
    );

    return (
        <ScreenWrapper
            testID={BeneficialOwnerCheckUBO.displayName}
            style={[styles.pt0]}
            scrollEnabled
        >
            <FormProvider
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                submitButtonText={translate('common.confirm')}
                onSubmit={handleSelectUBOValue}
                style={[styles.mh5, styles.flexGrow1]}
                submitButtonStyles={[styles.pb5, styles.mb0]}
            >
                <Text style={styles.textHeadline}>{title}</Text>
                <Text style={styles.pv5}>{translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}</Text>
                <RadioButtons
                    items={options}
                    onPress={setValue}
                    defaultCheckedValue={defaultValue}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

BeneficialOwnerCheckUBO.displayName = 'BeneficialOwnerCheckUBO';

export default BeneficialOwnerCheckUBO;
