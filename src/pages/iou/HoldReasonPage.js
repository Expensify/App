// import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import Form from "@components/Form";
import {View} from "react-native";
import TextInput from "@components/TextInput";
import CONST from "@src/CONST";
import lodashGet from "lodash/get";
import _ from "underscore";
import * as API from '@libs/API';

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
    }).isRequired
};

function HoldReasonPage({route}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const reasonRef = useRef();

    const transactionID = lodashGet(route, 'params.transactionID', '');
    // const iouType = lodashGet(route, 'params.iouType', '');

    const navigateBack = () => {
        Navigation.goBack();
    };

    const onSubmit = (values) => {
        // eslint-disable-next-line rulesdir/no-api-in-views
        API.write('HoldRequest', {
            transactionID,
            comment: values.reason
        })
    }

    const validate = useCallback((value) => {
        const errors = {};

        if (_.isEmpty(value.reason)) {
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
                title="Hold Request"
                onBackButtonPress={navigateBack}
            />
            <Form formID="moneyHoldReason" submitButtonText="Hold request" style={[styles.flexGrow1, styles.ph5]} onSubmit={onSubmit} validate={validate}>
                <Text style={[styles.textHeadline, styles.mb6]}>Explain why you're holding this request</Text>
                <View>
                    <TextInput
                        inputID="reason"
                        name="reason"
                        defaultValue=''
                        label='Reason'
                        accessibilityLabel={translate('common.merchant')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(e) => (reasonRef.current = e)}
                        autoFocus
                    />
                </View>
            </Form>
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
