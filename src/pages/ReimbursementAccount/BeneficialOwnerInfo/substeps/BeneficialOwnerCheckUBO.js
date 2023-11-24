import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Form from '@components/Form';
import RadioButtons from '@components/RadioButtons';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    title: PropTypes.string.isRequired,

    onSelectedValue: PropTypes.func.isRequired,
};

function BeneficialOwnerCheckUBO({title, onSelectedValue}) {
    const {translate} = useLocalize();
    const [value, setValue] = useState(undefined);

    const handleSelectUBOvalue = () => {
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
        // <Form
        //     formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
        //     submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
        //     validate={validate}
        //     onSubmit={onNext}
        //     style={[styles.mh5, styles.flexGrow1]}
        //     submitButtonStyles={[styles.pb5, styles.mb0]}
        // >
        <ScreenWrapper
            testID={BeneficialOwnerCheckUBO.displayName}
            style={[styles.pt0]}
            scrollEnabled
        >
            <ScrollView contentContainerStyle={[styles.mh5, styles.flexGrow1]}>
                <View>
                    <Text style={styles.textHeadline}>{title}</Text>
                    <Text style={styles.pv5}>{translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}</Text>
                    <RadioButtons
                        items={options}
                        onPress={setValue}
                        defaultCheckedValue={false}
                    />
                </View>
                <Button
                    success
                    style={[styles.w100, styles.mtAuto, styles.pb5]}
                    onPress={handleSelectUBOvalue}
                    text={translate('common.confirm')}
                />
            </ScrollView>
        </ScreenWrapper>
        // </Form>
    );
}

BeneficialOwnerCheckUBO.propTypes = propTypes;
BeneficialOwnerCheckUBO.displayName = 'BeneficialOwnerCheckUBO';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(BeneficialOwnerCheckUBO);
