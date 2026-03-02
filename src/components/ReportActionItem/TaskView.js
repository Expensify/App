    }

    return (
        <View style={[styles.p5, styles.borderRadiusNormal]}>
            <Text style={[styles.textSupporting, styles.mb1]} numberOfLines={0}>
                {props.taskReport.description}
            </Text>
        </View>
    );
};