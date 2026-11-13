import Button from '@components/Button';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import ConfirmationPage from '@components/ConfirmationPage';
import FilePicker from '@components/FilePicker';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useState} from 'react';
import {View} from 'react-native';

import {canSubmitLimitIncreaseRequest, hasLimitRequestInProgress, isValidLimitIncreaseAmount, isValidTaxReturn} from './limitIncreaseUtils';

type RequestLimitIncreasePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_REQUEST_LIMIT_INCREASE>;

function WorkspaceExpensifyCardRequestLimitIncreasePage({route}: RequestLimitIncreasePageProps) {
    const {policyID, domainAccountID} = route.params;
    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`);
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Hourglass']);
    const [desiredLimit, setDesiredLimit] = useState('');
    const [annualRevenue, setAnnualRevenue] = useState('');
    const [taxReturnFile, setTaxReturnFile] = useState<FileObject>();
    const [hasAuthorized, setHasAuthorized] = useState(false);
    const [hasInvalidFile, setHasInvalidFile] = useState(false);
    const isPending = hasLimitRequestInProgress(domain);
    const isLoadingDomain = isLoadingOnyxValue(domainMetadata);

    // The existing command still uses the Concierge contract. Do not send this form (or expose an enabled
    // confirmation button) until Expensify/Expensify#676200 ships the new upload/underwriting contract.
    const isSubmissionAvailable = false;
    const canSubmit = canSubmitLimitIncreaseRequest({
        desiredLimit,
        annualRevenue,
        taxReturnFile,
        hasAuthorized,
        isOffline,
        isPending,
        isSubmissionAvailable,
    });

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="WorkspaceExpensifyCardRequestLimitIncreasePage"
                shouldEnableMaxHeight
            >
                <Header>
                    <Header.BackButton onPress={() => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID))} />
                    <Header.Title title={translate('workspace.expensifyCard.requestLimitIncrease')} />
                </Header>
                {isLoadingDomain && <FullScreenLoadingIndicator />}
                {!isLoadingDomain && isPending && (
                    <ConfirmationPage>
                        <ConfirmationPage.Content>
                            <ConfirmationPage.Illustration illustration={icons.Hourglass} />
                            <ConfirmationPage.Heading>{translate('workspace.expensifyCard.limitIncreaseRequestReceived')}</ConfirmationPage.Heading>
                            <ConfirmationPage.Description>{translate('workspace.expensifyCard.limitIncreaseReviewing')}</ConfirmationPage.Description>
                        </ConfirmationPage.Content>
                        <FixedFooter>
                            <ConfirmationPage.PrimaryButton
                                text={translate('workspace.expensifyCard.gotIt')}
                                onPress={() => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID))}
                            />
                        </FixedFooter>
                    </ConfirmationPage>
                )}
                {!isLoadingDomain && !isPending && (
                    <>
                        <ScrollView
                            style={styles.flex1}
                            contentContainerStyle={[styles.ph5, styles.pb5]}
                        >
                            <Text style={[styles.textSupporting, styles.mb5]}>{translate('workspace.expensifyCard.limitIncreaseFormDescription')}</Text>
                            <TextInput
                                label={translate('workspace.expensifyCard.limitIncreaseDesiredLimit')}
                                accessibilityLabel={translate('workspace.expensifyCard.limitIncreaseDesiredLimit')}
                                inputMode={CONST.INPUT_MODE.DECIMAL}
                                value={desiredLimit}
                                editable={!isOffline}
                                onChangeText={setDesiredLimit}
                                errorText={desiredLimit && !isValidLimitIncreaseAmount(desiredLimit) ? translate('workspace.expensifyCard.limitIncreaseInvalidAmount') : undefined}
                                containerStyles={styles.mb4}
                            />
                            <TextInput
                                label={translate('workspace.expensifyCard.limitIncreaseAnnualRevenue')}
                                accessibilityLabel={translate('workspace.expensifyCard.limitIncreaseAnnualRevenue')}
                                inputMode={CONST.INPUT_MODE.DECIMAL}
                                value={annualRevenue}
                                editable={!isOffline}
                                onChangeText={setAnnualRevenue}
                                errorText={annualRevenue && !isValidLimitIncreaseAmount(annualRevenue) ? translate('workspace.expensifyCard.limitIncreaseInvalidAmount') : undefined}
                                containerStyles={styles.mb4}
                            />
                            <Text style={styles.mb2}>{translate('workspace.expensifyCard.limitIncreaseTaxReturn')}</Text>
                            <FilePicker acceptableFileTypes="application/pdf,.pdf">
                                {({openPicker}) => (
                                    <Button
                                        accessibilityLabel={translate('common.chooseFile')}
                                        isDisabled={isOffline}
                                        onPress={() =>
                                            openPicker({
                                                onPicked: (file) => {
                                                    const isValidFile = isValidTaxReturn(file);
                                                    setTaxReturnFile(isValidFile ? file : undefined);
                                                    setHasInvalidFile(!isValidFile);
                                                },
                                            })
                                        }
                                    >
                                        <Button.Text>{translate('common.chooseFile')}</Button.Text>
                                    </Button>
                                )}
                            </FilePicker>
                            {!!taxReturnFile?.name && <Text style={styles.mt2}>{taxReturnFile.name}</Text>}
                            {hasInvalidFile && (
                                <FormHelpMessage
                                    style={styles.mt2}
                                    message={translate('workspace.expensifyCard.limitIncreaseInvalidFile')}
                                />
                            )}
                            <CheckboxWithLabel
                                style={styles.mt5}
                                label={translate('workspace.expensifyCard.limitIncreaseAuthorization')}
                                accessibilityLabel={translate('workspace.expensifyCard.limitIncreaseAuthorization')}
                                isChecked={hasAuthorized}
                                disabled={isOffline}
                                onInputChange={(value) => setHasAuthorized(!!value)}
                            />
                        </ScrollView>
                        <FixedFooter style={styles.mtAuto}>
                            <View style={styles.mb3}>
                                <Text style={styles.textSupporting}>
                                    {translate(isOffline ? 'workspace.expensifyCard.limitIncreaseOffline' : 'workspace.expensifyCard.limitIncreaseUnavailable')}
                                </Text>
                            </View>
                            <Button
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                size={CONST.BUTTON_SIZE.LARGE}
                                isDisabled={!canSubmit}
                                accessibilityLabel={translate('common.confirm')}
                            >
                                <Button.Text>{translate('common.confirm')}</Button.Text>
                            </Button>
                        </FixedFooter>
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardRequestLimitIncreasePage;
