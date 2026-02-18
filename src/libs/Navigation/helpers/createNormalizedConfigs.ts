/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/default-param-last */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-restricted-types */
// THOSE FUNCTIONS ARE COPIED FROM react-navigation/core IN ORDER TO AVOID PATCHING
// THAT'S THE REASON WHY ESLINT IS DISABLED
import type {PathConfigMap} from '@react-navigation/native';

type ParseConfig = Record<string, (value: string) => any>;

type RouteConfig = {
    screen: string;
    regex?: RegExp;
    path: string;
    pattern: string;
    routeNames: string[];
    parse?: ParseConfig;
};

type InitialRouteConfig = {
    initialRouteName: string;
    parentScreens: string[];
};

const joinPaths = (...paths: string[]): string =>
    ([] as string[])
        .concat(...paths.map((p) => p.split('/')))
        .filter(Boolean)
        .join('/');

const createConfigItem = (screen: string, routeNames: string[], pattern: string, path: string, parse?: ParseConfig): RouteConfig => {
    // Normalize pattern to remove any leading, trailing slashes, duplicate slashes etc.
    pattern = pattern.split('/').filter(Boolean).join('/');

    const regex = pattern
        ? new RegExp(
              `^(${pattern
                  .split('/')
                  .map((it) => {
                      if (it.startsWith(':')) {
                          return `(([^/]+\\/)${it.endsWith('?') ? '?' : ''})`;
                      }

                      return `${it === '*' ? '.*' : escape(it)}\\/`;
                  })
                  .join('')})`,
          )
        : undefined;

    return {
        screen,
        regex,
        pattern,
        path,
        // The routeNames array is mutated, so copy it to keep the current state
        routeNames: [...routeNames],
        parse,
    };
};

const createNormalizedConfigs = (
    screen: string,
    routeConfig: PathConfigMap<object>,
    routeNames: string[] = [],
    initials: InitialRouteConfig[],
    parentScreens: string[],
    parentPattern?: string,
): RouteConfig[] => {
    const configs: RouteConfig[] = [];

    routeNames.push(screen);

    parentScreens.push(screen);

    // @ts-expect-error: we can't strongly typecheck this for now
    const config = routeConfig[screen];

    if (typeof config === 'string') {
        // If a string is specified as the value of the key(e.g. Foo: '/path'), use it as the pattern
        const pattern = parentPattern ? joinPaths(parentPattern, config) : config;

        configs.push(createConfigItem(screen, routeNames, pattern, config));
    } else if (typeof config === 'object') {
        let pattern: string | undefined;

        // if an object is specified as the value (e.g. Foo: { ... }),
        // it can have `path` property and
        // it could have `screens` prop which has nested configs
        if (typeof config.path === 'string') {
            if (config.exact && config.path === undefined) {
                throw new Error("A 'path' needs to be specified when specifying 'exact: true'. If you don't want this screen in the URL, specify it as empty string, e.g. `path: ''`.");
            }

            pattern = config.exact !== true ? joinPaths(parentPattern || '', config.path || '') : config.path || '';

            configs.push(createConfigItem(screen, routeNames, pattern!, config.path, config.parse));
        }

        if (config.screens) {
            // property `initialRouteName` without `screens` has no purpose
            if (config.initialRouteName) {
                initials.push({
                    initialRouteName: config.initialRouteName,
                    parentScreens,
                });
            }

            for (const nestedConfig of Object.keys(config.screens)) {
                const result = createNormalizedConfigs(nestedConfig, config.screens as PathConfigMap<object>, routeNames, initials, [...parentScreens], pattern ?? parentPattern);

                configs.push(...result);
            }
        }
    }

    routeNames.pop();

    return configs;
};

export type {RouteConfig};
export default createNormalizedConfigs;
