import React, { useMemo } from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import compose from '@libs/compose';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceUnitPageOnyxProps = {
    /** Draft form data related to workspaceRateAndUnitForm */
    formDraft: OnyxEntry<OnyxTypes.Form>;
};

type OptionRow = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

type WorkspaceUnitPageProps = WithPolicyProps & WorkspaceUnitPageOnyxProps;

function WorkspaceUnitPage(props: WorkspaceUnitPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const unitItems = useMemo(() => ({
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]: translate('common.kilometers'),
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES]: translate('common.miles'),
    }),[translate]);

    const updateUnit = (unit: string) => {
        // @ts-expect-error This is a problem with Form Draft type
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM_DRAFT, {unit});
        Navigation.goBack(ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? ''));
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
                // @ts-expect-error This is a problem with Form Draft type
                isSelected: (props.formDraft?.unit || defaultValue) === unit,
            });
        });
        return arr;
        // @ts-expect-error This is a problem with Form Draft type
    }, [defaultValue, props.formDraft?.unit, unitItems]);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.reimburse.trackDistance')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            shouldSkipVBBACall
            backButtonRoute={ROUTES.WORKSPACE_REIMBURSE.getRoute(props.policy?.id ?? '')}
            shouldShowLoading={false}
        >

            <Text style={[styles.mh5, styles.mv4]}>{translate('themePage.chooseThemeBelowOrSync')}</Text>

            <SelectionList
                // @ts-expect-error Migration pending for SelectionList
                sections={[{data: unitOptions}]}
                onSelectRow={(unit: OptionRow) => updateUnit(unit.value)}
                initiallyFocusedOptionKey={unitOptions.find((unit) => unit.isSelected)?.keyForList}
            />
        </WorkspacePageWithSections>
    );
}

WorkspaceUnitPage.displayName = 'WorkspaceUnitPage';

export default compose(
    withOnyx<WorkspaceUnitPageProps, WorkspaceUnitPageOnyxProps>({
        formDraft: {
            key: ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM_DRAFT,
        },
    }),
    withPolicy,
)(WorkspaceUnitPage);
