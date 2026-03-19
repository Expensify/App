/* eslint-disable */
import React from 'react';
import {useRef} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDefaultSecurityGroup} from '@libs/actions/Domain';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/DomainGroupCreateForm';

type DomainGroupCreatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.GROUP_CREATE>;

function DomainGroupCreatePage({route}: DomainGroupCreatePageProps) {
    const styles = useThemeStyles();
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();

    const inputRef = useRef<AnimatedTextInputRef>(null);

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                onEntryTransitionEnd={() => inputRef.current?.focus()}
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID="DomainGroupCreatePage"
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton
                    title={translate('domain.groups.createNewGroupButton')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID))}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.CREATE_DOMAIN_GROUP_FORM}
                    validate={(values: FormOnyxValues<typeof ONYXKEYS.FORMS.CREATE_DOMAIN_GROUP_FORM>) => {
                        const errors = {};
                        if (!values.name) {
                            addErrorMessage(errors, INPUT_IDS.NAME, translate('common.error.fieldRequired'));
                        } else if (values.name.length > CONST.FORM_CHARACTER_LIMIT) {
                            addErrorMessage(errors, INPUT_IDS.NAME, translate('common.error.characterLimitExceedCounter', values.name.length, CONST.FORM_CHARACTER_LIMIT));
                        }
                        return errors;
                    }}
                    onSubmit={() => {}}
                    submitButtonText={translate('domain.groups.createGroupSubmitButton')}
                    style={[styles.flex1, styles.ph5, styles.pb3]}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        label={translate('common.name')}
                        aria-label={translate('common.name')}
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.NAME}
                        defaultValue=""
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="done"
                        ref={inputRef}
                    />
                    <ScrollView></ScrollView>
                </FormProvider>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainGroupCreatePage;
