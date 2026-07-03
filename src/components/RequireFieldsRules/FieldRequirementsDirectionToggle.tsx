import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type FieldRequirementsDirection = ValueOf<typeof CONST.FIELD_REQUIREMENTS_DIRECTION>;

type FieldRequirementsDirectionToggleProps = {
    direction: FieldRequirementsDirection;
    disabled?: boolean;
    onSelect: (direction: FieldRequirementsDirection) => void;
};

function FieldRequirementsDirectionToggle({direction, disabled = false, onSelect}: FieldRequirementsDirectionToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isRequireSelected = direction === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE;
    const isWaiveDirectionSelected = direction === CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;

    return (
        <View style={[styles.flexRow, styles.border, styles.borderRadiusNormal]}>
            <Button
                text={translate('workspace.rules.requireFieldsRule.requireDirection')}
                onPress={() => onSelect(CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE)}
                isDisabled={disabled}
                small
                style={styles.ph0}
                innerStyles={!isRequireSelected ? styles.bgTransparent : undefined}
                textStyles={[styles.alignSelfCenter, !isRequireSelected ? styles.textSupporting : undefined]}
                accessibilityLabel={translate('workspace.rules.requireFieldsRule.requireDirection')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_DIRECTION_TOGGLE}
            />
            <Button
                text={translate('workspace.rules.requireFieldsRule.doNotRequireDirection')}
                onPress={() => onSelect(CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE)}
                isDisabled={disabled}
                small
                style={styles.ph0}
                innerStyles={!isWaiveDirectionSelected ? styles.bgTransparent : undefined}
                textStyles={[styles.alignSelfCenter, !isWaiveDirectionSelected ? styles.textSupporting : undefined]}
                accessibilityLabel={translate('workspace.rules.requireFieldsRule.doNotRequireDirection')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_DIRECTION_TOGGLE}
            />
        </View>
    );
}

FieldRequirementsDirectionToggle.displayName = 'FieldRequirementsDirectionToggle';

export default FieldRequirementsDirectionToggle;
