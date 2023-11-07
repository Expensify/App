import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import * as Browser from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';
import updateMultilineInputRange from '@libs/UpdateMultilineInputRange';
import styles from '@styles/styles';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';

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
        Navigation.goBack(ROUTES.MONEYTEMPORARYFORREFACTOR_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID), true);
    };

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestComment
     */
    const updateComment = (value) => {
        IOU.setMoneyRequestDescription_temporaryForRefactor(transactionID, value.moneyRequestComment);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.description')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepDescription.displayName}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                onSubmit={updateComment}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapperWithRef
                        InputComponent={TextInput}
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
            </FormProvider>
        </StepScreenWrapper>
    );
}

IOURequestStepDescription.propTypes = propTypes;
IOURequestStepDescription.defaultProps = defaultProps;
IOURequestStepDescription.displayName = 'IOURequestStepDescription';

export default withOnyx({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${lodashGet(route, 'params.transactionID', '0')}`,
    },
})(IOURequestStepDescription);
