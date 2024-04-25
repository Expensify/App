import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import * as App from '@userActions/App';
import CONST from '@src/CONST';

function WorkspacesSectionHeader() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.mh4, styles.mt6, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mb1]}>
            <View>
                <Text
                    style={styles.label}
                    color={theme.textSupporting}
                >
                    {translate('common.workspaces')}
                </Text>
            </View>
            <Tooltip text={translate('workspace.new.newWorkspace')}>
                <PressableWithFeedback
                    accessible={false}
                    role={CONST.ROLE.BUTTON}
                    onPress={() => {
                        Navigation.goBack();
                        interceptAnonymousUser(() => App.createWorkspaceWithPolicyDraftAndNavigateToIt());
                    }}
                >
                    {({hovered}) => (
                        <Icon
                            src={Expensicons.Plus}
                            width={12}
                            height={12}
                            additionalStyles={[styles.buttonDefaultBG, styles.borderRadiusNormal, styles.p2, hovered && styles.buttonHoveredBG]}
                            fill={theme.icon}
                        />
                    )}
                </PressableWithFeedback>
            </Tooltip>
        </View>
    );
}

export default WorkspacesSectionHeader;
