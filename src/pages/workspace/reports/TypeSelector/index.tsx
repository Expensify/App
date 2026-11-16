import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {authTokenTypeSelector} from '@src/selectors/Session';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

import type {ComponentRef, ForwardedRef} from 'react';
import type {View} from 'react-native';

import {Str} from 'expensify-common';
import React from 'react';

type TypeSelectorProps = Pick<MenuItemBaseProps, 'label' | 'rightLabel' | 'errorText'> & {
    value?: string;

    /** Route to the type picker */
    route: Route;

    ref?: ForwardedRef<ComponentRef<typeof View>>;
};

function TypeSelector({value, label = '', rightLabel, errorText = '', route, ref}: TypeSelectorProps) {
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    return (
        <MenuItem.Root
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.REPORT_FIELDS.CREATE_TYPE}
            ref={ref}
            onPress={callIfAuthenticated(() => Navigation.navigate(route), session)}
        >
            <MenuItemField.Row
                name={label}
                value={value ? Str.recapitalize(translate(getReportFieldTypeTranslationKey(value as PolicyReportFieldType))) : ''}
            >
                {!value && !errorText && !!rightLabel && <MenuItem.RightLabel>{rightLabel}</MenuItem.RightLabel>}
                {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                <MenuItem.Chevron />
            </MenuItemField.Row>
            {!!errorText && (
                <MenuItem.HelpText
                    isError
                    message={errorText}
                />
            )}
        </MenuItem.Root>
    );
}

export default TypeSelector;
