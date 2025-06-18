const path = require('path');
const WrmPlugin = require('atlassian-webresource-webpack-plugin');
const webpack = require('webpack');

const xmlOutPath = path.resolve(
    '..', 'backend', 'src', 'main', 'resources', 'META-INF', 'plugin-descriptors', 'wr-defs.xml'
)

module.exports = (_, { mode }) => {
    const watch = mode !== 'production'
    const isProduction = mode === 'production'

    return {
        watch,
        mode: mode || 'development',
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.jsx']
        },
        module: {
            rules: [{
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: { 
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ['@babel/preset-env', { modules: false }],
                            '@babel/preset-react',
                            '@babel/preset-typescript'
                        ]
                    }
                }
            }]
        },
        entry: {
            'wmprRequestsTable': './src/wmpr-requests-table.tsx',
            'wmprSettings': './src/wmpr-settings.tsx'
        },
        // Simplified optimization since we're using externals
        optimization: {
            usedExports: true,
            sideEffects: false
        },
        // Configure externals for Jira-provided dependencies
        externals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
            // UPDATED: More reliable AtlasKit external mappings
            '@atlaskit/button': {
                root: ['AJS', 'AtlasKit', 'Button'],
                commonjs: '@atlaskit/button',
                commonjs2: '@atlaskit/button',
                amd: '@atlaskit/button'
            },
            '@atlaskit/spinner': {
                root: ['AJS', 'AtlasKit', 'Spinner'],
                commonjs: '@atlaskit/spinner',
                commonjs2: '@atlaskit/spinner',
                amd: '@atlaskit/spinner'
            },
            '@atlaskit/lozenge': {
                root: ['AJS', 'AtlasKit', 'Lozenge'],
                commonjs: '@atlaskit/lozenge',
                commonjs2: '@atlaskit/lozenge',
                amd: '@atlaskit/lozenge'
            },
            '@atlaskit/textfield': {
                root: ['AJS', 'AtlasKit', 'TextField'],
                commonjs: '@atlaskit/textfield',
                commonjs2: '@atlaskit/textfield',
                amd: '@atlaskit/textfield'
            },
            '@atlaskit/form': {
                root: ['AJS', 'AtlasKit', 'Form'],
                commonjs: '@atlaskit/form',
                commonjs2: '@atlaskit/form',
                amd: '@atlaskit/form'
            },
            '@atlaskit/select': {
                root: ['AJS', 'AtlasKit', 'Select'],
                commonjs: '@atlaskit/select',
                commonjs2: '@atlaskit/select',
                amd: '@atlaskit/select'
            },
            '@atlaskit/toggle': {
                root: ['AJS', 'AtlasKit', 'Toggle'],
                commonjs: '@atlaskit/toggle',
                commonjs2: '@atlaskit/toggle',
                amd: '@atlaskit/toggle'
            },
            '@atlaskit/dynamic-table': {
                root: ['AJS', 'AtlasKit', 'DynamicTable'],
                commonjs: '@atlaskit/dynamic-table',
                commonjs2: '@atlaskit/dynamic-table',
                amd: '@atlaskit/dynamic-table'
            }
        },
        plugins: [
            // Add tracking identifier banner
            new webpack.BannerPlugin({
                banner: 'IKKKKKKE-WEBPACK-BUILD-001 - WMPR Bundle Loading Check',
                raw: false,
                entryOnly: true
            }),
            new WrmPlugin({
                watch,
                locationPrefix: '/frontend',
                pluginKey: 'com.example.wmpr.backend',
                xmlDescriptors: xmlOutPath,
                contextMap: {
                    'wmprRequestsTable': [
                        'servicedesk.portal.footer', 
                        'atl.general',
                        'atl.admin',  // For admin/project config pages
                        'jira.project.sidebar'  // For project-specific contexts
                    ],  // Load in multiple contexts including project config
                    'wmprSettings': [
                        'atl.admin',  // For admin/project config pages
                        'jira.project.sidebar',  // For project-specific contexts
                        'atl.general'  // General context for testing
                    ]  // Settings component for project configuration
                },
                // Jira provides these dependencies
                providedDependencies: {
                    'AJS': {
                        dependency: 'com.atlassian.auiplugin:ajs',
                        import: 'AJS'
                    },
                    'React': {
                        dependency: 'com.atlassian.jira.plugins.jira-react-plugin:react',
                        import: 'React'
                    },
                    'ReactDOM': {
                        dependency: 'com.atlassian.jira.plugins.jira-react-plugin:react',
                        import: 'ReactDOM'
                    }
                }
            }),
        ],
        output: {
            filename: 'bundled.[name].js', // Hardcoded filename for consistent loading
            path: path.resolve("../backend/src/main/resources/frontend"),
            // UPDATED: Improved library exposure for reliable component access
            library: {
                name: ['WMPR', '[name]'],
                type: 'window'
            },
            globalObject: 'window',
            // Ensure proper chunk loading
            chunkLoadingGlobal: 'webpackChunkWMPR',
            // Add clean option for consistent builds
            clean: true
        },
        // Performance budgets to catch large bundles
        performance: {
            maxAssetSize: 50000, // Much smaller since we're using externals
            maxEntrypointSize: 100000, 
            hints: 'warning'
        }
    };
};