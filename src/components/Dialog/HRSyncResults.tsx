import React, {useState} from 'react';
import type {CallContext} from 'react-call';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {RightDockedModal} from '@components/Modal/v2/variants';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getConnectedHRProvider} from '@libs/HRUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DialogActions} from './actions';
import type {DialogResponse} from './actions';
import createDialogCallable from './createDialogCallable';
import type {HRSyncResultsCallProps} from './types';

const EMPTY_SKIPPED: NonNullable<HRSyncResultsCallProps['result']['skippedEmployees']> = [];

const SYNC_ILLUSTRATION_SIZE = 68;

type HRSyncResultsCtx = CallContext<HRSyncResultsCallProps, DialogResponse, Record<string, never>>;

type HRSyncResultsInnerProps = HRSyncResultsCallProps & {call: HRSyncResultsCtx};

type SyncCountProps = {label: string; count: number};
type SkippedEmployeeProps = {name: string; reason: string};

function HRSyncResultsInner({call, result, policyID}: HRSyncResultsInnerProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const illustrations = useMemoizedLazyIllustrations(['SyncUsers']);
    const [isSkippedExpanded, setIsSkippedExpanded] = useState(false);

    const [providerName = ''] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: (policy) => getConnectedHRProvider(policy)?.displayName ?? '',
    });

    const addedCount = result.addedEmployeesCount ?? 0;
    const removedCount = result.removedEmployeesCount ?? 0;
    const skippedEmployees = result.skippedEmployees ?? EMPTY_SKIPPED;

    const close = () => call.end({action: DialogActions.CLOSE});
    const onOpenChange = (open: boolean) => {
        if (open) {
            return;
        }
        close();
    };

    return (
        <RightDockedModal.Root
            isOpen={!call.ended}
            onOpenChange={onOpenChange}
        >
            <RightDockedModal.Content>
                <View
                    testID="HRSyncResults"
                    style={[styles.flex1, styles.appBG]}
                >
                    <HeaderWithBackButton
                        title={translate('workspace.hr.syncResults.title', providerName)}
                        onBackButtonPress={close}
                    />
                    <ScrollView
                        contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb8]}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.alignItemsCenter, styles.mt4, styles.mb4, styles.pRelative]}>
                            <Icon
                                src={illustrations.SyncUsers}
                                width={SYNC_ILLUSTRATION_SIZE}
                                height={SYNC_ILLUSTRATION_SIZE}
                            />
                        </View>
                        <RightDockedModal.Title style={[styles.textHeadlineH1, styles.mb8]}>{translate('workspace.hr.syncResults.successTitle', providerName)}</RightDockedModal.Title>
                        <SyncCount
                            label={translate('workspace.hr.syncResults.added')}
                            count={addedCount}
                        />
                        <SyncCount
                            label={translate('workspace.hr.syncResults.removed')}
                            count={removedCount}
                        />
                        <PressableWithoutFeedback
                            accessibilityLabel={translate('workspace.hr.syncResults.skipped')}
                            accessibilityState={{expanded: isSkippedExpanded}}
                            sentryLabel="HRSyncResults-Skipped"
                            role={CONST.ROLE.BUTTON}
                            onPress={() => setIsSkippedExpanded((expanded) => !expanded)}
                            style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}
                        >
                            <SyncCount
                                label={translate('workspace.hr.syncResults.skipped')}
                                count={skippedEmployees.length}
                            />
                            <Icon
                                src={icons.DownArrow}
                                fill={theme.icon}
                                additionalStyles={isSkippedExpanded ? styles.flipUpsideDown : undefined}
                            />
                        </PressableWithoutFeedback>
                        {isSkippedExpanded &&
                            skippedEmployees.map((employee) => (
                                <SkippedEmployee
                                    key={employee.id}
                                    name={employee.name}
                                    reason={employee.reason}
                                />
                            ))}
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            large
                            success
                            text={translate('common.buttonConfirm')}
                            onPress={close}
                        />
                    </FixedFooter>
                </View>
            </RightDockedModal.Content>
        </RightDockedModal.Root>
    );
}

const HRSyncResults = createDialogCallable<HRSyncResultsCallProps>('HRSyncResults', HRSyncResultsInner);

function SyncCount({label, count}: SyncCountProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <View style={styles.mb6}>
            <Text style={[styles.textSupporting, styles.mb1]}>{label}</Text>
            <Text style={[styles.textNormalThemeText, styles.textStrong]}>{translate('workspace.hr.syncResults.employeeCount', {count})}</Text>
        </View>
    );
}

function SkippedEmployee({name, reason}: SkippedEmployeeProps) {
    const styles = useThemeStyles();
    return (
        <View style={styles.mt4}>
            <Text style={[styles.textNormalThemeText, styles.textStrong]}>{name}</Text>
            <Text style={styles.textSupporting}>{reason}</Text>
        </View>
    );
}

export default HRSyncResults;
