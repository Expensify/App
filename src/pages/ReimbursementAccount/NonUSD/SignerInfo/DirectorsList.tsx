import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import getValuesForSignerInfo from '@pages/ReimbursementAccount/NonUSD/utils/getValuesForSignerInfo';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type DirectorsListProps = {
    /** Method called when user confirms data */
    onConfirm: () => void;

    /** Method called when user presses on one of owners to edit its data */
    onEdit: (value: string) => void;

    /** List of owner keys */
    directorKeys: string[];
};

function DirectorsList({directorKeys, onConfirm, onEdit}: DirectorsListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const error = getLatestErrorMessage(reimbursementAccount);

    const additionalDirectorsOnly = directorKeys.filter((director) => director !== CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY);
    const directorData = getValuesForSignerInfo(additionalDirectorsOnly, reimbursementAccountDraft);
    const directors =
        reimbursementAccountDraft &&
        directorData.directors.map((director) => {
            return (
                <MenuItem
                    key={director.directorKey}
                    title={director.fullName}
                    description={`${director.jobTitle}, ${director.occupation}`}
                    wrapperStyle={[styles.ph5]}
                    icon={FallbackAvatar}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    onPress={() => {
                        onEdit(director.directorKey);
                    }}
                    iconWidth={40}
                    iconHeight={40}
                    interactive
                    shouldShowRightIcon
                    displayInDefaultIconColor
                />
            );
        });

    const areThereDirectors = directors !== undefined && directors?.length > 0;

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, styles.ph0, safeAreaPaddingBottomStyle]}
                >
                    {/* TODO: change translations */}
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('beneficialOwnerInfoStep.letsDoubleCheck')}</Text>
                    <Text style={[styles.p5, styles.textSupporting]}>{translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}</Text>
                    {areThereDirectors && (
                        <View>
                            <Text style={[styles.textSupporting, styles.pv1, styles.ph5]}>{`${translate('beneficialOwnerInfoStep.owners')}:`}</Text>
                            {directors}
                        </View>
                    )}
                    <View style={[styles.mtAuto, styles.p5]}>
                        {!!error && error.length > 0 && (
                            <DotIndicatorMessage
                                textStyles={[styles.formError]}
                                type="error"
                                messages={{error}}
                            />
                        )}
                        <Button
                            success
                            large
                            isLoading={reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields}
                            isDisabled={isOffline}
                            style={[styles.w100, styles.mt2]}
                            onPress={onConfirm}
                            text={translate('common.confirm')}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

DirectorsList.displayName = 'DirectorsList';

export default DirectorsList;
