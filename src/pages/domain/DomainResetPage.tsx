import React, {useEffect} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import {sanitizePhoneOrEmail} from '@libs/LoginUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import {resetDomain} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {adminAccountIDsSelector, domainNameSelector} from '@src/selectors/Domain';
import INPUT_IDS from '@src/types/form/ResetDomainForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainResetDomainPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.RESET_DOMAIN>;

function DomainResetDomainPage({route}: DomainResetDomainPageProps) {
    const {domainAccountID, accountID} = route.params;

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${route.params.domainAccountID}`, {canBeMissing: true});

    // Selectors used this way bc when useOnyx with it the metadata is wrong + we're already have domain data here
    const domainName = domainNameSelector(domain);
    const adminAccountIDs = adminAccountIDsSelector(domain);
    const domainHasOnlyOneAdmin = adminAccountIDs?.length === 1;
    const isLoadingDomain = isLoadingOnyxValue(domainMetadata);

    useEffect(() => {
        // Make sure reset domain page cannot be accessed if there is more than 1 admin
        if (isLoadingDomain || domainHasOnlyOneAdmin) {
            return;
        }
        Navigation.goBack(ROUTES.DOMAIN_ADMIN_DETAILS.getRoute(domainAccountID, accountID));
    }, [accountID, domainAccountID, domainHasOnlyOneAdmin, isLoadingDomain]);

    const missingDomainData = !domain || !domainName;
    const isSubmitDisabled = missingDomainData || !domainHasOnlyOneAdmin;

    const handleResetDomain = () => {
        if (isSubmitDisabled) {
            Log.hmmm('Domain data is missing or there are more than 1 admin left');
            return;
        }
        resetDomain(route.params.domainAccountID, domainName, domain);
        Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.RESET_DOMAIN_FORM>) => {
        const errors = getFieldRequiredErrors(values, ['domainName']);

        if (values.domainName && domainName) {
            const isValid = sanitizePhoneOrEmail(domainName) === sanitizePhoneOrEmail(values.domainName);

            if (!isValid) {
                errors.domainName = translate('domain.admins.error.removeDomainNameInvalid');
            }
        }

        return errors;
    };

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldUseCachedViewportHeight
            testID="DomainResetDomainPage"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('domain.admins.resetDomain')}
                onBackButtonPress={() => Navigation.goBack()}
            />

            <FormProvider
                formID={ONYXKEYS.FORMS.RESET_DOMAIN_FORM}
                validate={validate}
                onSubmit={handleResetDomain}
                submitButtonText={translate('domain.admins.resetDomain')}
                style={[styles.flexGrow1, styles.mh5]}
                isSubmitActionDangerous
                isSubmitDisabled={isSubmitDisabled}
            >
                <View
                    fsClass={CONST.FULLSTORY.CLASS.UNMASK}
                    style={styles.flexGrow1}
                >
                    <View style={styles.mt5}>
                        <RenderHTML
                            html={translate('domain.admins.resetDomainInfo')}
                            onLinkPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(Navigation.getActiveRoute()))}
                        />
                    </View>
                    <View style={styles.mt5}>
                        <RenderHTML html={translate('domain.admins.resetDomainExplanation', {domainName})} />
                    </View>
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

export default DomainResetDomainPage;
