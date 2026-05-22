import type {ForwardedRef} from 'react';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type InitialListValueSelectorProps = Pick<MenuItemBaseProps, 'label' | 'rightLabel' | 'errorText'> & {
    /** Policy ID */
    policyID?: string;

    /** Currently selected value */
    value?: string;

    /** Subtitle to display on field */
    subtitle?: string;

    /** Function to call when the user selects a value */
    onInputChange?: (value: string) => void;

    /** Reference to the outer element */
    ref: ForwardedRef<View>;
};

function InitialListValueSelector({policyID = '', value = '', label = '', rightLabel, errorText = '', onInputChange, ref}: InitialListValueSelectorProps) {
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);

    useEffect(() => {
        const currentValueIndex = Object.values(formDraft?.listValues ?? {}).findIndex((listValue) => listValue === value);
        const isCurrentValueDisabled = formDraft?.disabledListValues?.[currentValueIndex] ?? true;

        if (isCurrentValueDisabled && value !== '') {
            onInputChange?.('');
        }
    }, [formDraft?.disabledListValues, formDraft?.listValues, onInputChange, value]);

    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon
                title={value}
                description={label}
                rightLabel={rightLabel}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_INITIAL_LIST_VALUE.getRoute(policyID))}
            />
        </View>
    );
}

export default InitialListValueSelector;
