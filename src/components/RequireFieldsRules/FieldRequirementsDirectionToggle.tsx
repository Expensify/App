import Button from '@components/ButtonComposed';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {FieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

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
                onPress={() => onSelect(CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE)}
                isDisabled={disabled}
                size={CONST.BUTTON_SIZE.SMALL}
                style={styles.ph0}
                innerStyles={!isRequireSelected ? styles.bgTransparent : undefined}
                accessibilityLabel={translate('workspace.rules.requireFieldsRule.requireDirection')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_DIRECTION_TOGGLE}
            >
                <Button.Text style={[styles.alignSelfCenter, !isRequireSelected ? styles.textSupporting : undefined]}>
                    {translate('workspace.rules.requireFieldsRule.requireDirection')}
                </Button.Text>
            </Button>
            <Button
                onPress={() => onSelect(CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE)}
                isDisabled={disabled}
                size={CONST.BUTTON_SIZE.SMALL}
                style={styles.ph0}
                innerStyles={!isWaiveDirectionSelected ? styles.bgTransparent : undefined}
                accessibilityLabel={translate('workspace.rules.requireFieldsRule.doNotRequireDirection')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_DIRECTION_TOGGLE}
            >
                <Button.Text style={[styles.alignSelfCenter, !isWaiveDirectionSelected ? styles.textSupporting : undefined]}>
                    {translate('workspace.rules.requireFieldsRule.doNotRequireDirection')}
                </Button.Text>
            </Button>
        </View>
    );
}

export default FieldRequirementsDirectionToggle;
