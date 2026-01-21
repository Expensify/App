import React, {createContext, useCallback, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues} from '@libs/actions/FormActions';
import {normalizeCountryCode} from '@libs/CountryUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsForm} from '@src/types/form';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import LegalName from './substeps/LegalName';
import PhoneNumber from './substeps/PhoneNumber';
import Pin from './substeps/Pin';
import type {CustomSubStepProps} from './types';
import {getInitialSubstep, getSubstepValues} from './utils';

type MissingPersonalDetailsContentProps = {
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    draftValues: OnyxEntry<PersonalDetailsForm>;

    /** Optional custom header title */
    headerTitle?: string;

    /** Completion handler */
    onComplete: () => void;
};

type PinCodeContextType = {
    finalPinCode: string;
    setFinalPinCode: (newPinCode: string) => void;
};

const PinCodeContext = createContext<PinCodeContextType>({
    finalPinCode: '',
    setFinalPinCode: () => {},
});

const formSteps = [LegalName, DateOfBirth, Address, PhoneNumber, Pin, Confirmation];

function MissingPersonalDetailsContent({privatePersonalDetails, draftValues, headerTitle, onComplete}: MissingPersonalDetailsContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [finalPinCode, setFinalPinCode] = useState('');

    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);

    const values = useMemo(() => normalizeCountryCode(getSubstepValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm, [privatePersonalDetails, draftValues]);

    const startFrom = useMemo(() => getInitialSubstep(values), [values]);

    const handleFinishStep = useCallback(() => {
        if (!values) {
            return;
        }
        onComplete();
    }, [onComplete, values]);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        screenIndex,
        moveTo,
        goToTheLastStep,
        lastScreenIndex,
    } = useSubStep<CustomSubStepProps>({bodyContent: formSteps, startFrom, onFinished: handleFinishStep});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            ref.current?.moveTo(lastScreenIndex);

            return;
        }

        // Clicking back on the first screen should dismiss the modal
        if (screenIndex === CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME) {
            clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
            Navigation.goBack();
            return;
        }
        ref.current?.movePrevious();
        prevScreen();
    };

    const handleNextScreen = useCallback(() => {
        if (isEditing) {
            goToTheLastStep();
            ref.current?.moveTo(lastScreenIndex);
            return;
        }
        ref.current?.moveNext();
        nextScreen();
    }, [goToTheLastStep, isEditing, nextScreen, lastScreenIndex]);

    const handleMoveTo = useCallback(
        (step: number) => {
            ref.current?.moveTo(step);
            moveTo(step);
        },
        [moveTo],
    );

    const contextValue = useMemo(
        () => ({
            finalPinCode,
            setFinalPinCode,
        }),
        [finalPinCode, setFinalPinCode],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID="MissingPersonalDetailsContent"
        >
            <HeaderWithBackButton
                title={headerTitle ?? translate('workspace.expensifyCard.addShippingDetails')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.NETSUITE_FORM_STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    ref={ref}
                    startStepIndex={startFrom}
                    stepNames={CONST.MISSING_PERSONAL_DETAILS_INDEXES.INDEX_LIST}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={handleNextScreen}
                onMove={handleMoveTo}
                screenIndex={screenIndex}
                personalDetailsValues={values}
            />
        </ScreenWrapper>
    );
}

export default MissingPersonalDetailsContent;

export {PinCodeContext};
