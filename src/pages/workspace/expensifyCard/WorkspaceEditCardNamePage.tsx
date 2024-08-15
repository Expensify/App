import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditExpensifyCardNameForm';

type WorkspaceEditCardNamePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_NAME>;

function WorkspaceEditCardNamePage({route}: WorkspaceEditCardNamePageProps) {
    const {policyID, cardID} = route.params;
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();

    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);
    const card = cardsList?.[cardID];

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_NAME_FORM>) => {
        Card.updateExpensifyCardTitle(workspaceAccountID, Number(cardID), values[INPUT_IDS.NAME], card?.nameValuePairs?.cardTitle);
        Navigation.goBack();
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_NAME_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_NAME_FORM> =>
        ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.NAME]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceEditCardNamePage.displayName}
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.card.issueNewCard.cardName')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID))}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_NAME_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submit}
                    style={[styles.flex1, styles.mh5]}
                    enabledWhenOffline
                    validate={validate}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.NAME}
                        label={translate('workspace.card.issueNewCard.cardName')}
                        hint={translate('workspace.card.issueNewCard.giveItNameInstruction')}
                        aria-label={translate('workspace.card.issueNewCard.cardName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={card?.nameValuePairs?.cardTitle}
                        maxLength={CONST.EXPENSIFY_CARD.CARD_TITLE_INPUT_LIMIT}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceEditCardNamePage.displayName = 'WorkspaceEditCardNamePage';

export default WorkspaceEditCardNamePage;
