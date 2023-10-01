// TODO: This file came from MoneyRequestDescriptionPage - verify it's still the same when ready to merge and clean up the old file
import React, {useRef, useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {useFocusEffect} from '@react-navigation/native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import TextInput from '../../../../components/TextInput';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import * as IOU from '../../../../libs/actions/IOU';
import CONST from '../../../../CONST';
import useLocalize from '../../../../hooks/useLocalize';
import updateMultilineInputRange from '../../../../libs/UpdateMultilineInputRange';
import * as Browser from '../../../../libs/Browser';
import transactionPropTypes from '../../../../components/transactionPropTypes';

const propTypes = {
    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: transactionPropTypes,

    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of iou (eg. scan/manual/distance) */
            iouType: PropTypes.string,

            /** The report ID of the IOU's report */
            reportID: PropTypes.string,

            /** The transaction ID of the IOU */
            transactionID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    transaction: {},
};

function IOURequestStepDescription({
    transaction,
    route: {
        params: {iouType, reportID, transactionID},
    },
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

    const goBack = () => {
        Navigation.goBack(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID));
    };

    /**
     * Sets the money request comment by saving it to Onyx.
     *
     * @param {Object} value
     * @param {String} value.moneyRequestComment
     */
    const updateComment = (value) => {
        IOU.setMoneeRequestDescription(transactionID, value.moneyRequestComment);
        goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={IOURequestStepDescription.displayName}
        >
            <>
                <HeaderWithBackButton
                    title={translate('common.description')}
                    onBackButtonPress={goBack}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                    onSubmit={updateComment}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="moneyRequestComment"
                            name="moneyRequestComment"
                            defaultValue={lodashGet(transaction, 'comment.comment', '')}
                            label={translate('moneyRequestConfirmationList.whatsItFor')}
                            accessibilityLabel={translate('moneyRequestConfirmationList.whatsItFor')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            ref={(el) => {
                                if (!el) {
                                    return;
                                }
                                inputRef.current = el;
                                updateMultilineInputRange(inputRef.current);
                            }}
                            autoGrowHeight
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
                            textAlignVertical="top"
                            submitOnEnter={!Browser.isMobile()}
                        />
                    </View>
                </Form>
            </>
        </ScreenWrapper>
    );
}

IOURequestStepDescription.propTypes = propTypes;
IOURequestStepDescription.defaultProps = defaultProps;
IOURequestStepDescription.displayName = 'IOURequestStepDescription';

export default withOnyx({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID')}`,
    },
})(IOURequestStepDescription);
