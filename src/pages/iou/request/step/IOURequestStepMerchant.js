import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {useFocusEffect} from '@react-navigation/native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import styles from '@styles/styles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import useLocalize from '@hooks/useLocalize';
import transactionPropTypes from '@components/transactionPropTypes';
import TextInput from '@components/TextInput';
import ONYXKEYS from '@src/ONYXKEYS';
import Form from '@components/Form';
import StepScreenWrapper from './StepScreenWrapper';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function IOURequestStepMerchant({
    route: {
        params: {iouType, reportID, transactionID},
    },
    transaction: {merchant},
}) {
    const {translate} = useLocalize();
    const inputRef = useRef(null);
    const focusTimeoutRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
                return () => {
                    if (!focusTimeoutRef.current) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, []),
    );

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID), true);
    };

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestMerchant
     */
    const validate = useCallback((value) => {
        const errors = {};

        if (_.isEmpty(value.moneyRequestMerchant)) {
            errors.moneyRequestMerchant = 'common.error.fieldRequired';
        }

        return errors;
    }, []);

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestMerchant
     */
    const updateMerchant = (value) => {
        IOU.setMoneeRequestMerchant_temporaryForRefactor(transactionID, value.moneyRequestMerchant);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.merchant')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepMerchant.displayName}
        >
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM}
                onSubmit={(value) => updateMerchant(value)}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <TextInput
                        inputID="moneyRequestMerchant"
                        name="moneyRequestMerchant"
                        defaultValue={merchant}
                        maxLength={CONST.MERCHANT_NAME_MAX_LENGTH}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(el) => (inputRef.current = el)}
                    />
                </View>
            </Form>
        </StepScreenWrapper>
    );
}

IOURequestStepMerchant.propTypes = propTypes;
IOURequestStepMerchant.defaultProps = defaultProps;
IOURequestStepMerchant.displayName = 'IOURequestStepMerchant';

export default withOnyx({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID', '0')}`,
    },
})(IOURequestStepMerchant);
