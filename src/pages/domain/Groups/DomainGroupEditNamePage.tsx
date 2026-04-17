import {selectGroupByID} from '@selectors/Domain';
import React, {useRef} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {updateDomainSecurityGroup} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/DomainGroupEditNameForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type DomainGroupEditNamePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.GROUP_EDIT_NAME>;

function DomainGroupEditNamePage({route}: DomainGroupEditNamePageProps) {
    const {domainAccountID, groupID} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const inputRef = useRef<AnimatedTextInputRef>(null);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_DOMAIN_GROUP_NAME_FORM>): Errors => {
        const errors = {};

        if (!values.name) {
            addErrorMessage(errors, INPUT_IDS.NAME, translate('common.error.fieldRequired'));
        } else if (values.name.length > CONST.FORM_CHARACTER_LIMIT) {
            addErrorMessage(errors, INPUT_IDS.NAME, translate('common.error.characterLimitExceedCounter', values.name.length, CONST.FORM_CHARACTER_LIMIT));
        }

        return errors;
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                onEntryTransitionEnd={() => inputRef.current?.focus()}
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID="DomainGroupEditNamePage"
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton
                    title={translate('common.name')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, groupID))}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.EDIT_DOMAIN_GROUP_NAME_FORM}
                    validate={validate}
                    onSubmit={(values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_DOMAIN_GROUP_NAME_FORM>) => {
                        if (!group) {
                            return;
                        }

                        if (values.name !== group.name) {
                            updateDomainSecurityGroup(domainAccountID, groupID, group, {name: values.name}, 'name');
                        }
                        Navigation.goBack(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, groupID));
                    }}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    style={[styles.flex1, styles.ph5, styles.pb3]}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        label={translate('common.name')}
                        aria-label={translate('common.name')}
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.NAME}
                        defaultValue={group?.name ?? ''}
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="done"
                        ref={inputRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainGroupEditNamePage;
