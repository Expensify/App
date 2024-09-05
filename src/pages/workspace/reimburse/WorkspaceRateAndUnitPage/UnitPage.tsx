import React, {useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Text from '@components/Text';
import type {UnitItemType} from '@components/UnitPicker';
import UnitPicker from '@components/UnitPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {WorkspaceRateAndUnit} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceUnitPageBaseProps = WithPolicyProps;

type WorkspaceRateAndUnitOnyxProps = {
    workspaceRateAndUnit: OnyxEntry<WorkspaceRateAndUnit>;
};

type WorkspaceUnitPageProps = WorkspaceUnitPageBaseProps & WorkspaceRateAndUnitOnyxProps;
function WorkspaceUnitPage(props: WorkspaceUnitPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (props.workspaceRateAndUnit?.policyID === props.policy?.id) {
            return;
        }
        Policy.setPolicyIDForReimburseView(props.policy?.id ?? '-1');
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const updateUnit = (unit: UnitItemType) => {
        Policy.setUnitForReimburseView(unit.value);
        Navigation.goBack(ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? '-1'));
    };

    const defaultValue = useMemo(() => {
        const defaultDistanceCustomUnit = PolicyUtils.getCustomUnit(props.policy);
        return defaultDistanceCustomUnit?.attributes.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    }, [props.policy]);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.reimburse.trackDistanceUnit')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            backButtonRoute={ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? '-1')}
            shouldShowLoading={false}
            shouldShowBackButton
        >
            {() => (
                <>
                    <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.reimburse.trackDistanceChooseUnit')}</Text>
                    <UnitPicker
                        defaultValue={props.workspaceRateAndUnit?.unit ?? defaultValue}
                        onOptionSelected={updateUnit}
                    />
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceUnitPage.displayName = 'WorkspaceUnitPage';

function ComponentWithOnyx(props: Omit<WorkspaceUnitPageProps, keyof WorkspaceRateAndUnitOnyxProps>) {
    const [workspaceRateAndUnit, workspaceRateAndUnitMetadata] = useOnyx(ONYXKEYS.WORKSPACE_RATE_AND_UNIT);

    if (isLoadingOnyxValue(workspaceRateAndUnitMetadata)) {
        return null;
    }

    return (
        <WorkspaceUnitPage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            workspaceRateAndUnit={workspaceRateAndUnit}
        />
    );
}

export default withPolicy(ComponentWithOnyx);
