import React, { useMemo } from 'react';
import SelectionList from '@components/SelectionList';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import type {RouteProp} from '@react-navigation/native';

type OptionRow = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

type WorkspaceUnitPageProps = WithPolicyOnyxProps & {
    route: RouteProp<{params: {policyID: string; unit?: string; rate?: string;}}>;
};

function WorkspaceUnitPage(props: WorkspaceUnitPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const unitItems = useMemo(() => ({
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]: translate('common.kilometers'),
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES]: translate('common.miles'),
    }),[translate]);

    const updateUnit = (unit: string) => {
        Navigation.navigate(ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? '', unit, props.route.params.rate));
    }

    const defaultValue = useMemo(() => {
        const defaultDistanceCustomUnit = Object.values(props.policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
        return defaultDistanceCustomUnit?.attributes.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    }, [props.policy?.customUnits]);

    const unitOptions = useMemo(() => {
        const arr: OptionRow[] = [];
        Object.entries(unitItems).forEach(([unit, label]) => {
            arr.push({
                value: unit,
                text: label,
                keyForList: unit,
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                isSelected: (props.route.params.unit || defaultValue) === unit,
            });
        });
        return arr;
    }, [defaultValue, props.route.params.unit, unitItems]);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.reimburse.trackDistance')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            shouldSkipVBBACall
            backButtonRoute={ROUTES.WORKSPACE_REIMBURSE.getRoute(props.policy?.id ?? '')}
            shouldShowLoading={false}
        >
            {() => (
                <>
                    <Text style={[styles.mh5, styles.mv4]}>{translate('themePage.chooseThemeBelowOrSync')}</Text>

                    <SelectionList
                        // @ts-expect-error Migration pending for SelectionList
                        sections={[{data: unitOptions}]}
                        onSelectRow={(unit: OptionRow) => updateUnit(unit.value)}
                        initiallyFocusedOptionKey={unitOptions.find((unit) => unit.isSelected)?.keyForList}
                    />
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceUnitPage.displayName = 'WorkspaceUnitPage';

export default withPolicy(WorkspaceUnitPage);
