/* eslint-disable no-case-declarations */
import React, {useCallback, useMemo, useRef} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsForm} from '@src/types/form/PersonalDetailsForm';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import Address from './substeps/Address';
import DateOfBirth from './substeps/DateOfBirth';
import LegalName from './substeps/LegalName';
import PhoneNumber from './substeps/PhoneNumber';
import type {CustomSubStepProps, SubStepsValues} from './types';

const formSteps = [LegalName, DateOfBirth, Address, PhoneNumber];

function MissingPersonalDetails() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [personalDetailsForm] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
    const [personalDetailsFormDraft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    const firstUnissuedCard = useMemo(() => Object.values(cardList ?? {}).find((card) => card.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED), [cardList]);
    const values = useMemo(() => {
        return Object.entries(INPUT_IDS).reduce((acc, [, value]) => {
            // @ts-expect-error complaints about Country not being a string, but it is
            acc[value] = (personalDetailsFormDraft?.[value] ?? personalDetailsForm?.[value] ?? '') as PersonalDetailsForm[keyof PersonalDetailsForm];
            return acc;
        }, {} as SubStepsValues);
    }, [personalDetailsForm, personalDetailsFormDraft]);

    const handleFinishStep = useCallback(() => {
        PersonalDetails.updatePersonalDetailsAndShipExpensifyCard(values, firstUnissuedCard?.cardID ?? 0);
        Navigation.goBack();
    }, [firstUnissuedCard?.cardID, values]);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        screenIndex,
        moveTo,
        goToTheLastStep,
    } = useSubStep<CustomSubStepProps>({
        bodyContent: formSteps,
        startFrom: CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME,
        onFinished: handleFinishStep,
        onNextSubStep: () => ref.current?.moveNext(),
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        // Clicking back on the first screen should dismiss the modal
        if (screenIndex === CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME) {
            Navigation.goBack();
            return;
        }
        ref.current?.movePrevious();
        prevScreen();
    };

    // TODO: consider if this is necessary
    // const handleNextScreen = useCallback(() => {
    //     if (isEditing) {
    //         goToTheLastStep();
    //         return;
    //     }
    //     ref.current?.moveNext();
    //     nextScreen();
    // }, [goToTheLastStep, isEditing, nextScreen]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={MissingPersonalDetails.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.expensifyCard.addShippingDetails')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.NETSUITE_FORM_STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    ref={ref}
                    startStepIndex={CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME}
                    stepNames={CONST.MISSING_PERSONAL_DETAILS_INDEXES.INDEX_LIST}
                />
            </View>
            <View style={styles.ph5}>
                <SubStep
                    isEditing={isEditing}
                    onNext={nextScreen}
                    onMove={moveTo}
                    screenIndex={screenIndex}
                    privatePersonalDetails={privatePersonalDetails}
                />
            </View>
        </ScreenWrapper>
    );
}

MissingPersonalDetails.displayName = 'MissingPersonalDetails';

export default MissingPersonalDetails;
