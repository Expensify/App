import React, {useEffect, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {WorkspaceRateAndUnit} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

type OptionRow = {
    value: Unit;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

type WorkspaceUnitPageBaseProps = WithPolicyProps;

type WorkspaceRateAndUnitOnyxProps = {
    workspaceRateAndUnit: OnyxEntry<WorkspaceRateAndUnit>;
};

type WorkspaceUnitPageProps = WorkspaceUnitPageBaseProps & WorkspaceRateAndUnitOnyxProps;
function WorkspaceUnitPage(props: WorkspaceUnitPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const unitItems = useMemo(
        () => ({
            [CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]: translate('workspace.reimburse.kilometers'),
            [CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES]: translate('workspace.reimburse.miles'),
        }),
        [translate],
    );

    useEffect(() => {
        if (props.workspaceRateAndUnit?.policyID === props.policy?.id) {
            return;
        }
        Policy.setPolicyIDForReimburseView(props.policy?.id ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateUnit = (unit: Unit) => {
        Policy.setUnitForReimburseView(unit);
        Navigation.navigate(ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? ''));
    };

    const defaultValue = useMemo(() => {
        const defaultDistanceCustomUnit = Object.values(props.policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
        return defaultDistanceCustomUnit?.attributes.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    }, [props.policy?.customUnits]);

    const unitOptions = useMemo(() => {
        const arr: OptionRow[] = [];
        Object.entries(unitItems).forEach(([unit, label]) => {
            arr.push({
                value: unit as Unit,
                text: label,
                keyForList: unit,
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                isSelected: (props.workspaceRateAndUnit?.unit || defaultValue) === unit,
            });
        });
        return arr;
    }, [defaultValue, props.workspaceRateAndUnit?.unit, unitItems]);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.reimburse.trackDistanceUnit')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            shouldSkipVBBACall
            backButtonRoute={ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? '')}
            shouldShowLoading={false}
            shouldShowBackButton
        >
            {() => (
                <>
                    <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.reimburse.trackDistanceChooseUnit')}</Text>

                    <SelectionList
                        sections={[{data: unitOptions}]}
                        ListItem={RadioListItem}
                        onSelectRow={(unit: OptionRow) => updateUnit(unit.value)}
                        initiallyFocusedOptionKey={unitOptions.find((unit) => unit.isSelected)?.keyForList}
                    />
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceUnitPage.displayName = 'WorkspaceUnitPage';

export default compose(
    withOnyx<WorkspaceUnitPageProps, WorkspaceRateAndUnitOnyxProps>({
        workspaceRateAndUnit: {
            key: ONYXKEYS.WORKSPACE_RATE_AND_UNIT,
        },
    }),
    withPolicy,
)(WorkspaceUnitPage);
