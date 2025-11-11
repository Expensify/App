import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function HelpDotLink() {
	const styles = useThemeStyles();
	const theme = useTheme();
	const {translate} = useLocalize();

	return (
		<View style={[styles.flexRow, styles.alignItemsCenter, styles.mt6]}>
			<Icon
				src={Expensicons.QuestionMark}
				width={12}
				height={12}
				fill={theme.icon}
			/>
			<TextLink
				style={[styles.textMicro, styles.ml2]}
				href={CONST.HELP_LINK_URL}
			>
				{translate('additionalDetailsStep.helpLink')}
			</TextLink>
		</View>
	);
}

HelpDotLink.displayName = 'HelpDotLink';

export default HelpDotLink;


