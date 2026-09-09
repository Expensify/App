import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import {useIsAppLoadPending} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useVerifyAccountAndResume from '@hooks/useVerifyAccountAndResume';

import {clearCreateDomainAccountID, clearDomainFromFailedCreation, createDomain, resetCreateDomainForm, setCreateDomainAlreadyHaveAccessError} from '@libs/actions/Domain';
import {clearDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import {getFieldRequiredErrors, isPublicDomain} from '@libs/ValidationUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/CreateDomainForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef} from 'react';

function AddDomainPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const [form] = useOnyx(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM);
    const [allDomains, allDomainsResult] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const isAppLoadPending = useIsAppLoadPending();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CREATE_DOMAIN_FORM>) => {
            const errors = getFieldRequiredErrors(values, [INPUT_IDS.DOMAIN_NAME], translate);
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

    // Domains we had before submitting. The BE returns the same generic failure whether or not we already have access to the
    // existing domain, so this is what tells the two apart. Stays undefined until we submit with loaded domain data, so we never
    // judge the response against an incomplete set.
    const domainKeysBeforeCreation = useRef<Set<string> | undefined>(undefined);

    // The domain name only lives in form state, which the verify account page can't reach, so we resume the submit here instead of forwarding from that page.
    const {isUserValidated, verifyAccountAndResume} = useVerifyAccountAndResume((resumeCreateDomain?: () => void) => resumeCreateDomain?.());

    useEffect(() => {
        if (!form?.hasCreationSucceeded) {
            return;
        }

        // Find the newly created domain because the accountID is not optimistically created in App, but created in BE
        const accountID = Object.values(allDomains ?? {})?.find(
            (domain) => domain && submittedDomainName.current && Str.caseInsensitiveEquals(Str.extractEmailDomain(domain.email), submittedDomainName.current),
        )?.accountID;

        if (accountID) {
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.WORKSPACES_DOMAIN_ADDED.getRoute(accountID), {forceReplace: true}));
        }
    }, [form?.hasCreationSucceeded, allDomains]);

    useEffect(() => {
        const domainAccountID = form?.domainAccountID;
        if (!domainAccountID) {
            return;
        }

        if (!domainKeysBeforeCreation.current) {
            const domainKey = `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`;
            if (form.domainKeysBeforeCreation && !form.domainKeysBeforeCreation.includes(domainKey)) {
                clearDomainFromFailedCreation(domainAccountID, allDomains?.[domainKey]?.domain_adminRequesters);
            }
            clearCreateDomainAccountID();
            return;
        }

        if (domainKeysBeforeCreation.current.has(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`)) {
            setCreateDomainAlreadyHaveAccessError();
            return;
        }

        clearDomainFromFailedCreation(domainAccountID, allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`]?.domain_adminRequesters);
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.WORKSPACES_DOMAIN_ALREADY_EXISTS.getRoute(domainAccountID), {forceReplace: true}));
    }, [form?.domainAccountID, form?.domainKeysBeforeCreation, allDomains]);

    useEffect(() => {
        resetCreateDomainForm();

        return () => {
            clearDraftValues(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM);
            resetCreateDomainForm();
        };
    }, []);

    return (
        <ScreenWrapper testID="AddDomainPage">
            <HeaderWithBackButton
                title={translate('domain.addDomain.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAINS_LIST.getRoute())}
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
                    shouldHideServerError={!!form?.domainAccountID}
                    onSubmit={({domainName}) => {
                        const submitDomain = () => {
                            submittedDomainName.current = domainName;
                            domainKeysBeforeCreation.current = isLoadingOnyxValue(allDomainsResult)
                                ? undefined
                                : new Set(Object.keys(allDomains ?? {}).filter((domainKey) => !!allDomains?.[domainKey]?.accountID));
                            createDomain(domainName, domainKeysBeforeCreation.current);
                        };

                        if (!isUserValidated) {
                            return verifyAccountAndResume(submitDomain);
                        }
                        submitDomain();
                    }}
                    isLoading={!!form?.isLoading || isAppLoadPending}
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
