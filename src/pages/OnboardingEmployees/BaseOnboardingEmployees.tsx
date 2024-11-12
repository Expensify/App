import React, {useMemo, useState} from 'react';
import Onyx, {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Policy from '@userActions/Policy/Policy';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import type {OnboardingCompanySizeType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingEmployeesProps} from './types';

type OnboardingListItem = ListItem & {
    keyForList: OnboardingCompanySizeType;
};
function BaseOnboardingEmployees({shouldUseNativeStyles, route}: BaseOnboardingEmployeesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [selectedCompanySize, setSelectedCompanySize] = useState<OnboardingCompanySizeType | null | undefined>(onboardingCompanySize);
    const [error, setError] = useState('');

    const companySizeOptions: OnboardingListItem[] = useMemo(() => {
        return Object.values(CONST.ONBOARDING_COMPANY_SIZE).map((companySize): OnboardingListItem => {
            return {
                text: translate(`onboarding.employees.${companySize}`),
                keyForList: companySize,
                isSelected: companySize === selectedCompanySize,
            };
        });
    }, [translate, selectedCompanySize]);

    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const setOptimticQAGuidePersonalDetail = () => {
        const actorAccountID = CONST.ACCOUNT_ID.QA_GUIDE;
        const optimisticPersonalDetailForQAGuide = {
            accountID: actorAccountID,
            avatar: allPersonalDetails?.[actorAccountID]?.avatar,
            displayName: allPersonalDetails?.[actorAccountID]?.displayName ?? CONST.EMAIL.QA_GUIDE,
            login: CONST.EMAIL.QA_GUIDE,
        };
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[actorAccountID]: optimisticPersonalDetailForQAGuide});
    };

    const footerContent = (
        <>
            {!!error && (
                <FormHelpMessage
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message={error}
                />
            )}
            <Button
                success
                large
                text={translate('common.continue')}
                onPress={() => {
                    if (!selectedCompanySize) {
                        setError(translate('onboarding.errorSelection'));
                        return;
                    }
                    Welcome.setOnboardingCompanySize(selectedCompanySize);

                    if (!onboardingPolicyID) {
                        const {adminsChatReportID, policyID} = Policy.createWorkspace(undefined, true, '', Policy.generatePolicyID(), CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
                        Welcome.setOnboardingAdminsChatReportID(adminsChatReportID);
                        Welcome.setOnboardingPolicyID(policyID);
                        setOptimticQAGuidePersonalDetail();
                    }

                    Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute(route.params?.backTo));
                }}
                pressOnEnter
            />
        </>
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingEmployees"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ? 50 : 75}
                onBackButtonPress={Navigation.goBack}
            />
            <Text style={[styles.textHeadlineH1, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                {translate('onboarding.employees.title')}
            </Text>
            <SelectionList
                sections={[{data: companySizeOptions}]}
                onSelectRow={(item) => {
                    setSelectedCompanySize(item.keyForList);
                    setError('');
                }}
                initiallyFocusedOptionKey={companySizeOptions.find((item) => item.keyForList === selectedCompanySize)?.keyForList}
                shouldUpdateFocusedIndex
                ListItem={RadioListItem}
                footerContent={footerContent}
                listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []}
            />
        </ScreenWrapper>
    );
}

BaseOnboardingEmployees.displayName = 'BaseOnboardingEmployees';

export default BaseOnboardingEmployees;
