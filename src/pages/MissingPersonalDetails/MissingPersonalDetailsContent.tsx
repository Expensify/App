import React, {useCallback, useMemo, useRef, useState} from 'react';
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
import {updatePersonalDetailsAndShipExpensifyCards} from '@libs/actions/PersonalDetails';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsForm} from '@src/types/form';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import MissingPersonalDetailsMagicCodeModal from './MissingPersonalDetailsMagicCodeModal';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import LegalName from './substeps/LegalName';
import PhoneNumber from './substeps/PhoneNumber';
import type {CustomSubStepProps} from './types';
import {getInitialSubstep, getSubstepValues} from './utils';

type MissingPersonalDetailsContentProps = {
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    draftValues: OnyxEntry<PersonalDetailsForm>;
};

const formSteps = [LegalName, DateOfBirth, Address, PhoneNumber, Confirmation];

function MissingPersonalDetailsContent({privatePersonalDetails, draftValues}: MissingPersonalDetailsContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(false);

    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);

    const values = useMemo(() => getSubstepValues(privatePersonalDetails, draftValues), [privatePersonalDetails, draftValues]);

    const startFrom = useMemo(() => getInitialSubstep(values), [values]);

    const handleFinishStep = useCallback(() => {
        if (!values) {
            return;
        }
        setIsValidateCodeActionModalVisible(true);
    }, [values]);

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

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            updatePersonalDetailsAndShipExpensifyCards(values, validateCode);
        },
        [values],
    );

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

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={MissingPersonalDetailsContent.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.expensifyCard.addShippingDetails')}
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

            <MissingPersonalDetailsMagicCodeModal
                onClose={() => setIsValidateCodeActionModalVisible(false)}
                isValidateCodeActionModalVisible={isValidateCodeActionModalVisible}
                handleSubmitForm={handleSubmitForm}
            />
        </ScreenWrapper>
    );
}

MissingPersonalDetailsContent.displayName = 'MissingPersonalDetailsContent';

export default MissingPersonalDetailsContent;
