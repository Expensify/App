// import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen via route :iouType/new/category/:reportID? */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

function HoldReasonPage({route}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const reasonRef = useRef();

    // const transactionID = lodashGet(route, 'params.transactionID', '');
    // const iouType = lodashGet(route, 'params.iouType', '');

    const navigateBack = () => {
        Navigation.goBack();
    };

    const onSubmit = (values) => {
        // TODO - add a helper function for API call
        // eslint-disable-next-line rulesdir/no-api-in-views
        console.log(values);
    };

    const validate = useCallback((value) => {
        const errors = {};

        if (_.isEmpty(value.comment)) {
            errors.reason = 'common.error.fieldRequired';
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

export default compose(
    withOnyx({
        iou: {
            key: ONYXKEYS.IOU,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        report: {
            key: ({route, iou}) => {
                const reportID = IOU.getIOUReportID(iou, route);

                return `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            },
        },
    }),
)(HoldReasonPage);
