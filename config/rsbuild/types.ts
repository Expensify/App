type Environment = {
    file?: string;
    platform?: 'web';
    // True only for the interactive `rsbuild dev` command (never for `build` or Storybook), so the
    // OXC loader can enable React Fast Refresh alongside ReactRefreshRspackPlugin (see
    // getOxcAndWorkletsLoaders in rsbuild.common.ts).
    isDevServer?: boolean;
};

export default Environment;
