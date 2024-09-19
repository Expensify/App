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
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import LegalName from './substeps/LegalName';
import PhoneNumber from './substeps/PhoneNumber';
import type {CustomSubStepProps} from './types';
import {getInitialSubstep, getSubstepValues} from './utils';

const formSteps = [LegalName, DateOfBirth, Address, PhoneNumber, Confirmation];

function MissingPersonalDetails() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);

    const values = useMemo(() => getSubstepValues(privatePersonalDetails, draftValues), [privatePersonalDetails, draftValues]);

    const startFrom = useMemo(() => getInitialSubstep(values), [values]);

    const firstUnissuedCard = useMemo(() => Object.values(cardList ?? {}).find((card) => card.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED), [cardList]);

    const handleFinishStep = useCallback(() => {
        if (!values) {
            return;
        }
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
    } = useSubStep<CustomSubStepProps>({bodyContent: formSteps, startFrom, onFinished: handleFinishStep});

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

    const handleNextScreen = useCallback(() => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        ref.current?.moveNext();
        nextScreen();
    }, [goToTheLastStep, isEditing, nextScreen]);

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
            <SubStep
                isEditing={isEditing}
                onNext={handleNextScreen}
                onMove={moveTo}
                screenIndex={screenIndex}
                privatePersonalDetails={privatePersonalDetails}
            />
        </ScreenWrapper>
    );
}

MissingPersonalDetails.displayName = 'MissingPersonalDetails';

export default MissingPersonalDetails;
