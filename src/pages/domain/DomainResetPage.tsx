import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import {resetDomain} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {domainNameSelector} from '@src/selectors/Domain';
import INPUT_IDS from '@src/types/form/ResetDomainForm';

type DomainResetDomainPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.RESET_DOMAIN>;

function DomainResetDomainPage({route}: DomainResetDomainPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();

    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${route.params.domainAccountID}`, {canBeMissing: true, selector: domainNameSelector});

    const contactMethodRoute = `${environmentURL}/${ROUTES.SETTINGS_CONTACT_METHODS.route}`;

    const handleResetDomain = () => {
        resetDomain(route.params.domainAccountID);
        Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
    };

    const sanitizePhoneOrEmail = (phoneOrEmail: string): string => phoneOrEmail.replaceAll(/\s+/g, '').toLowerCase();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.RESET_DOMAIN_FORM>) => {
        const errors = getFieldRequiredErrors(values, ['domainName']);

        if (values.domainName && domainName) {
            const isValid = sanitizePhoneOrEmail(domainName) === sanitizePhoneOrEmail(values.domainName);

            if (!isValid) {
                errors.domainName = translate('closeAccountPage.enterYourDefaultContactMethod');
            }
        }

        return errors;
    };

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldUseCachedViewportHeight
            testID={DomainResetDomainPage.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('domain.admins.resetDomain')}
                onBackButtonPress={() => {
                    Navigation.goBack();
                }}
            />

            <FormProvider
                formID={ONYXKEYS.FORMS.RESET_DOMAIN_FORM}
                validate={validate}
                onSubmit={handleResetDomain}
                submitButtonText={translate('domain.admins.resetDomain')}
                style={[styles.flexGrow1, styles.mh5]}
                isSubmitActionDangerous
            >
                <View
                    fsClass={CONST.FULLSTORY.CLASS.UNMASK}
                    style={styles.flexGrow1}
                >
                    <Text style={styles.mt5}>
                        <RenderHTML html={translate('domain.admins.resetDomainInfo', {contactMethodRoute})} />
                    </Text>
                    <Text style={styles.mt5}>
                        <RenderHTML html={translate('domain.admins.resetDomainExplanation', {domainName})} />
                    </Text>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.DOMAIN_NAME}
                        label={translate('domain.admins.enterDomainName')}
                        aria-label={translate('domain.admins.enterDomainName')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={styles.mt5}
                        forwardedFSClass={CONST.FULLSTORY.CLASS.UNMASK}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

DomainResetDomainPage.displayName = 'DomainResetDomainPage';

export default DomainResetDomainPage;
