import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';
import {getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

import type {ForwardedRef} from 'react';
import type {View} from 'react-native';

import {Str} from 'expensify-common';
import React from 'react';

type TypeSelectorProps = Pick<MenuItemBaseProps, 'label' | 'rightLabel' | 'errorText'> & {
    /** Currently selected type */
    value?: string;

    /** Policy ID used to build the picker route */
    policyID?: string;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
};

function TypeSelector({value, label = '', rightLabel, errorText = '', policyID, ref}: TypeSelectorProps) {
    const {translate} = useLocalize();

    return (
        <MenuItemWithTopDescription
            ref={ref}
            shouldShowRightIcon
            title={value ? Str.recapitalize(translate(getReportFieldTypeTranslationKey(value as PolicyReportFieldType))) : ''}
            description={label}
            rightLabel={rightLabel}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={errorText}
            onPress={() => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_TYPE_SELECTOR.getRoute(policyID, value as PolicyReportFieldType | undefined));
            }}
        />
    );
}

export default TypeSelector;
