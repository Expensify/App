module.exports = {
    project: {
        ios: {sourceDir: 'ios', unstable_reactLegacyComponentNames: ['AutoLayoutView', 'CellContainer']},
        android: {
            unstable_reactLegacyComponentNames: ['AutoLayoutView', 'CellContainer'],
        },
    },
    assets: ['./assets/fonts/native'],
};
