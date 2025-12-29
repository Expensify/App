import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateExpensifyCardTitle} from '@libs/actions/Card';
import {filterInactiveCards} from '@libs/CardUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditExpensifyCardNameForm';

type WorkspaceEditCardNamePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_NAME | typeof SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_NAME>;

function WorkspaceEditCardNamePage({route}: WorkspaceEditCardNamePageProps) {
    const {policyID, cardID, backTo} = route.params;
    const defaultFundID = useDefaultFundID(policyID);

    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();

    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards, canBeMissing: true});
    const card = cardsList?.[cardID];

    const isWorkspaceRhp = route.name === SCREENS.WORKSPACE.EXPENSIFY_CARD_NAME;

    const goBack = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.goBack(isWorkspaceRhp ? ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID) : ROUTES.EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID));
    }, [backTo, isWorkspaceRhp, policyID, cardID]);

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_NAME_FORM>) => {
        updateExpensifyCardTitle(defaultFundID, Number(cardID), values[INPUT_IDS.NAME], card?.nameValuePairs?.cardTitle);
        goBack();
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_NAME_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_NAME_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.NAME]);
        const length = values.name.length;
        if (length > CONST.STANDARD_LENGTH_LIMIT) {
            addErrorMessage(errors, INPUT_IDS.NAME, translate('common.error.characterLimitExceedCounter', length, CONST.STANDARD_LENGTH_LIMIT));
        }
        return errors;
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceEditCardNamePage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.card.issueNewCard.cardName')}
                    onBackButtonPress={goBack}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_NAME_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submit}
                    style={[styles.flex1, styles.mh5]}
                    enabledWhenOffline
                    validate={validate}
                    shouldHideFixErrorsAlert
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.NAME}
                        label={translate('workspace.card.issueNewCard.cardName')}
                        hint={translate('workspace.card.issueNewCard.giveItNameInstruction')}
                        aria-label={translate('workspace.card.issueNewCard.cardName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={card?.nameValuePairs?.cardTitle}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceEditCardNamePage;
