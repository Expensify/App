import {format} from 'date-fns';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setTransactionStartDate} from '@libs/actions/CompanyCards';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AssignCardForm';

type TransactionStartDateSelectorModalProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_TRANSACTION_START_DATE>;

function TransactionStartDateSelectorPage({route}: TransactionStartDateSelectorModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const startDate = assignCard?.startDate ?? assignCard?.data?.startDate ?? format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    const policyID = route.params.policyID;

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ASSIGN_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ASSIGN_CARD_FORM> =>
        getFieldRequiredErrors(values, [INPUT_IDS.START_DATE]);

    const goBack = () => {
        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, route.params.feed, route.params.backTo));
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ASSIGN_CARD_FORM>) => {
        setTransactionStartDate(values[INPUT_IDS.START_DATE]);
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                style={styles.pb0}
                testID={TransactionStartDateSelectorPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('common.date')}
                    shouldShowBackButton
                    onBackButtonPress={goBack}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.ASSIGN_CARD_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submit}
                    style={[styles.flexGrow1, styles.ph5]}
                    enabledWhenOffline
                    validate={validate}
                >
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={INPUT_IDS.START_DATE}
                        minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                        maxDate={new Date()}
                        defaultValue={startDate}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

TransactionStartDateSelectorPage.displayName = 'TransactionStartDateSelectorPage';

export default TransactionStartDateSelectorPage;
