import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import goToSettings from '@libs/goToSettings';

const base = 'multifactorAuthentication.pleaseEnableInSystemSettings' as const;

const tPaths = {
    start: `${base}.start`,
    link: `${base}.link`,
    end: `${base}.end`,
} as const;

function NoEligibleMethodsDescription() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const start = translate(tPaths.start);
    const link = translate(tPaths.link);
    const end = translate(tPaths.end);

    return (
        <Text style={[styles.textAlignCenter, styles.textSupporting]}>
            {start}
            <TextLink onPress={goToSettings}>{link}</TextLink>
            {end}
        </Text>
    );
}

NoEligibleMethodsDescription.displayName = 'NoEligibleMethodsDescription';

export default NoEligibleMethodsDescription;
