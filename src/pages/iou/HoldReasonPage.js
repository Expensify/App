import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen via route :iouType/new/category/:reportID? */
        params: PropTypes.shape({
            /** ID of the transaction the page was opened for */
            transactionID: PropTypes.string,

            /** ID of the report that user is providing hold reason to */
            reportID: PropTypes.string,

            /** Link to previous page */
            backTo: PropTypes.string,
        }),
    }).isRequired,
};

function HoldReasonPage({route}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const reasonRef = useRef();

    const transactionID = lodashGet(route, 'params.transactionID', '');
    const reportID = lodashGet(route, 'params.reportID', '');
    const backTo = lodashGet(route, 'params.backTo', '');

    const navigateBack = () => {
        Navigation.navigate(backTo);
    };

    const onSubmit = (values) => {
        IOU.putOnHold(transactionID, values.comment, reportID);
        navigateBack();
    };

    const validate = useCallback((value) => {
        const errors = {};

        if (_.isEmpty(value.comment)) {
            errors.comment = 'common.error.fieldRequired';
        }

        return errors;
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={HoldReasonPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('iou.holdRequest')}
                onBackButtonPress={navigateBack}
            />
            <FormProvider
                formID="moneyHoldReason"
                submitButtonText={translate('iou.holdRequest')}
                style={[styles.flexGrow1, styles.ph5]}
                onSubmit={onSubmit}
                validate={validate}
                enabledWhenOffline
            >
                <Text style={[styles.textHeadline, styles.mb6]}>{translate('iou.explainHold')}</Text>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="comment"
                        valueType="string"
                        name="comment"
                        defaultValue=""
                        label="Reason"
                        accessibilityLabel={translate('iou.reason')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(e) => (reasonRef.current = e)}
                        autoFocus
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

HoldReasonPage.displayName = 'MoneyRequestHoldReasonPage';
HoldReasonPage.propTypes = propTypes;

export default HoldReasonPage;
