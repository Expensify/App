import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {createDomain, resetCreateDomainForm} from '@libs/actions/Domain';
import {clearDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import {getFieldRequiredErrors, isPublicDomain} from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isUserValidatedSelector} from '@src/selectors/Account';
import INPUT_IDS from '@src/types/form/CreateDomainForm';

function AddDomainPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const [form] = useOnyx(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {canBeMissing: true});
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {canBeMissing: false});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true, selector: isUserValidatedSelector});

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CREATE_DOMAIN_FORM>) => {
            const errors = getFieldRequiredErrors(values, [INPUT_IDS.DOMAIN_NAME]);
            const domainName = values[INPUT_IDS.DOMAIN_NAME];
            if (!domainName) {
                return errors;
            }
            if (!Str.isValidDomainName(domainName)) {
                errors[INPUT_IDS.DOMAIN_NAME] = translate('iou.invalidDomainError');
            } else if (isPublicDomain(domainName)) {
                errors[INPUT_IDS.DOMAIN_NAME] = translate('iou.publicDomainError');
            }
            return errors;
        },
        [translate],
    );

    const submittedDomainName = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!form?.hasCreationSucceeded) {
            return;
        }

        // Find the newly created domain because the accountID is not optimistically created in App, but created in BE
        const accountID = Object.values(allDomains ?? {})?.find(
            (domain) => domain && submittedDomainName.current && Str.caseInsensitiveEquals(Str.extractEmailDomain(domain.email), submittedDomainName.current),
        )?.accountID;
        if (accountID) {
            Navigation.navigate(ROUTES.WORKSPACES_DOMAIN_ADDED.getRoute(accountID), {forceReplace: true});
        }
    }, [form?.hasCreationSucceeded, allDomains]);

    useEffect(() => {
        resetCreateDomainForm();
        return () => clearDraftValues(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM);
    }, []);

    return (
        <ScreenWrapper testID="AddDomainPage">
            <HeaderWithBackButton
                title={translate('domain.addDomain.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.getRoute())}
            />
            <ScrollView
                contentContainerStyle={[styles.ph5, styles.pt3, styles.flexGrow1, styles.gap5]}
                keyboardShouldPersistTaps="always"
            >
                <Text>{translate('domain.addDomain.subtitle')}</Text>

                <FormProvider
                    formID={ONYXKEYS.FORMS.CREATE_DOMAIN_FORM}
                    validate={validate}
                    style={styles.flexGrow1}
                    submitButtonText={translate('common.continue')}
                    onSubmit={({domainName}) => {
                        if (!isUserValidated) {
                            return Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN_VERIFY_ACCOUNT);
                        }
                        submittedDomainName.current = domainName;
                        createDomain(domainName);
                    }}
                    isLoading={form?.isLoading}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.DOMAIN_NAME}
                        label={translate('domain.addDomain.domainName')}
                        accessibilityLabel={translate('domain.addDomain.domainName')}
                        spellCheck={false}
                        shouldSaveDraft
                        shouldSubmitForm
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default AddDomainPage;
