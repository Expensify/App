/**
 * Edits a domain group's Expensify Card limit, which applies to members' cards that follow the group limit.
 */
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getExpensifyCardLimitError, getExpensifyCardLimitErrorMessage} from '@libs/CardUtils';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import {updateDomainSecurityGroup} from '@userActions/Domain';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditExpensifyCardLimitForm';

import {domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';

type DomainGroupEditCardLimitPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.GROUP_EDIT_CARD_LIMIT>;

function DomainGroupEditCardLimitPage({route}: DomainGroupEditCardLimitPageProps) {
    const {domainAccountID, groupID} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const currency = useCurrencyForExpensifyCard({fundID: domainAccountID});

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [deleteGroupPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('deleteGroup', groupID),
    });

    // A group without a stored limit has a limit of 0.
    const storedLimit = group?.defaultCardUnapprovedExpenseLimit ?? 0;

    const goBack = () => Navigation.goBack(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, groupID));

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_DOMAIN_GROUP_CARD_LIMIT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_DOMAIN_GROUP_CARD_LIMIT_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.LIMIT], translate);
        if (errors.limit) {
            return errors;
        }

        const limitError = getExpensifyCardLimitError(values.limit);
        if (limitError) {
            errors.limit = getExpensifyCardLimitErrorMessage(translate, limitError);
        }
        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_DOMAIN_GROUP_CARD_LIMIT_FORM>) => {
        if (!group) {
            return;
        }

        const newLimit = convertToBackendAmount(Number(values[INPUT_IDS.LIMIT]));
        if (newLimit !== storedLimit) {
            updateDomainSecurityGroup(domainAccountID, groupID, group, {defaultCardUnapprovedExpenseLimit: newLimit}, 'defaultCardUnapprovedExpenseLimit');
        }
        goBack();
    };

    return (
        <DomainNotFoundPageWrapper
            domainAccountID={domainAccountID}
            shouldBeBlocked={!group || !!deleteGroupPendingAction}
            fullPageNotFoundViewProps={{
                onBackButtonPress: () => Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID)),
            }}
        >
            <ScreenWrapper
                testID="DomainGroupEditCardLimitPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.expensifyCard.cardLimit')}
                    onBackButtonPress={goBack}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.EDIT_DOMAIN_GROUP_CARD_LIMIT_FORM}
                    submitButtonText={translate('common.save')}
                    shouldHideFixErrorsAlert
                    onSubmit={submit}
                    style={styles.flex1}
                    submitButtonStyles={[styles.mh5, styles.mt0]}
                    submitFlexEnabled={false}
                    enabledWhenOffline
                    validate={validate}
                >
                    <InputWrapper
                        InputComponent={AmountForm}
                        defaultValue={convertToFrontendAmountAsString(storedLimit, 0)}
                        isCurrencyPressable={false}
                        currency={currency}
                        inputID={INPUT_IDS.LIMIT}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainGroupEditCardLimitPage;
