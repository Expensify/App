import React from 'react';
import {View} from 'react-native';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import TextInput from '../../../../components/TextInput';
import CONST from '../../../../CONST';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';

const propTypes = {
    ...subStepPropTypes,
};

const validate = (values) => {};

function FullNamePersonalStep({onNext}) {
    const {translate} = useLocalize();

    return (
        <View>
            <Form
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                submitButtonText={translate('common.next')}
                validate={validate}
                onSubmit={submit}
                style={[styles.mh5, styles.flexGrow1]}
                scrollContextEnabled
            >
                <View style={[styles.flexRow]}>
                    <View style={[styles.flex2, styles.mr2]}>
                        <TextInput
                            inputID={props.inputKeys.firstName}
                            shouldSaveDraft={props.shouldSaveDraft}
                            label={`${props.translate('common.firstName')}`}
                            accessibilityLabel={props.translate('common.firstName')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            value={props.values.firstName}
                            defaultValue={props.defaultValues.firstName}
                            onChangeText={(value) => props.onFieldChange({firstName: value})}
                            errorText={props.errors.firstName ? props.translate('bankAccount.error.firstName') : ''}
                        />
                    </View>
                    <View style={[styles.flex2]}>
                        <TextInput
                            inputID={props.inputKeys.lastName}
                            shouldSaveDraft={props.shouldSaveDraft}
                            label={`${props.translate('common.lastName')}`}
                            accessibilityLabel={props.translate('common.lastName')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            value={props.values.lastName}
                            defaultValue={props.defaultValues.lastName}
                            onChangeText={(value) => props.onFieldChange({lastName: value})}
                            errorText={props.errors.lastName ? props.translate('bankAccount.error.lastName') : ''}
                        />
                    </View>
                </View>
            </Form>
        </View>
    );
}

FullNamePersonalStep.propTypes = propTypes;
FullNamePersonalStep.defaultProps = defaultProps;
FullNamePersonalStep.displayName = 'FullNamePersonalStep';

export default compose(withOnyx({}))(FullNamePersonalStep);
