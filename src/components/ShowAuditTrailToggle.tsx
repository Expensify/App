import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setShowAuditTrail} from '@userActions/AuditTrail';
import ONYXKEYS from '@src/ONYXKEYS';
import Switch from './Switch';

function ShowAuditTrailToggle() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [showAuditTrail = true] = useOnyx(ONYXKEYS.SHOW_AUDIT_TRAIL);

    return (
        <View style={styles.justifyContentCenter}>
            <Switch
                isOn={showAuditTrail}
                accessibilityLabel={translate('reportDetailsPage.showAuditTrail')}
                onToggle={setShowAuditTrail}
            />
        </View>
    );
}

export default ShowAuditTrailToggle;
