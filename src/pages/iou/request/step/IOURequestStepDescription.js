import React, {useRef, useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import styles from '@styles/styles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import useLocalize from '@hooks/useLocalize';
import updateMultilineInputRange from '@libs/UpdateMultilineInputRange';
import * as Browser from '@libs/Browser';
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

function IOURequestStepDescription({
    route: {
        params: {iouType, reportID, transactionID},
    },
    transaction,
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
     * @param {String} value.moneyRequestComment
     */
    const updateComment = (value) => {
        IOU.setMoneeRequestDescription_temporaryForRefactor(transactionID, value.moneyRequestComment);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.description')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepDescription.displayName}
        >
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
        </StepScreenWrapper>
    );
}

IOURequestStepDescription.propTypes = propTypes;
IOURequestStepDescription.defaultProps = defaultProps;
IOURequestStepDescription.displayName = 'IOURequestStepDescription';

export default withOnyx({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID', '0')}`,
    },
})(IOURequestStepDescription);
