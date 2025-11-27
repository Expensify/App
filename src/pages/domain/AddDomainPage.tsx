import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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
import {createDomain} from '@libs/actions/Domain';
import Navigation from '@libs/Navigation/Navigation';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CreateDomainForm} from '@src/types/form/CreateDomainForm';
import INPUT_IDS from '@src/types/form/CreateDomainForm';

const hasCreationSucceededSelector = (form: OnyxEntry<CreateDomainForm>) => form?.hasCreationSucceeded;

function AddDomainPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const [hasCreationSucceeded] = useOnyx(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {canBeMissing: true, selector: hasCreationSucceededSelector});
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {canBeMissing: false});

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.CREATE_DOMAIN_FORM>) => {
        return getFieldRequiredErrors(values, [INPUT_IDS.DOMAIN_NAME]);
    }, []);

    const domainNameSubmitted = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!hasCreationSucceeded) {
            return;
        }

        // Find the newly created domain
        const accountID = Object.values(allDomains ?? {})?.find((domain) => domain && Str.extractEmailDomain(domain.email) === domainNameSubmitted.current)?.accountID;
        if (accountID) {
            Navigation.navigate(ROUTES.WORKSPACES_DOMAIN_ADDED.getRoute(accountID), {forceReplace: true});
        }
    }, [hasCreationSucceeded, allDomains]);

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID={AddDomainPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('domain.addDomain.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.getRoute())}
            />
            <ScrollView
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="always"
            >
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.mb3, styles.webViewStyles.baseFontStyle]}>{translate('domain.addDomain.subtitle')}</Text>
                </View>
                <FormProvider
                    formID={ONYXKEYS.FORMS.CREATE_DOMAIN_FORM}
                    validate={validate}
                    submitButtonText={translate('common.continue')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    onSubmit={({domainName}) => {
                        domainNameSubmitted.current = domainName;
                        createDomain(domainName);
                    }}
                    addBottomSafeAreaPadding
                    shouldRenderFooterAboveSubmit
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.DOMAIN_NAME}
                            label={translate('domain.addDomain.title')}
                            accessibilityLabel={translate('domain.addDomain.title')}
                            spellCheck={false}
                            ref={inputCallbackRef}
                            shouldSaveDraft
                            shouldSubmitForm
                        />
                    </View>
                </FormProvider>
            </ScrollView>
        </ScreenWrapper>
    );
}

AddDomainPage.displayName = 'AddDomainPage';
export default AddDomainPage;
