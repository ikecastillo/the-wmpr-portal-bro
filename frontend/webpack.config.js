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
            // Use Jira's existing AtlasKit components
            '@atlaskit/button': ['AJS', 'AtlasKit', 'Button'],
            '@atlaskit/spinner': ['AJS', 'AtlasKit', 'Spinner'], 
            '@atlaskit/lozenge': ['AJS', 'AtlasKit', 'Lozenge'],
            '@atlaskit/textfield': ['AJS', 'AtlasKit', 'TextField'],
            '@atlaskit/form': ['AJS', 'AtlasKit', 'Form'],
            '@atlaskit/select': ['AJS', 'AtlasKit', 'Select'],
            '@atlaskit/toggle': ['AJS', 'AtlasKit', 'Toggle']
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
                locationPrefix: '/frontend/',
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
            // CRITICAL FIX: Properly expose our initialization function
            library: {
                name: 'WMPR',
                type: 'window',
                export: 'default'
            },
            // Ensure proper chunk loading
            chunkLoadingGlobal: 'webpackChunkWMPR'
        },
        // Performance budgets to catch large bundles
        performance: {
            maxAssetSize: 50000, // Much smaller since we're using externals
            maxEntrypointSize: 100000, 
            hints: 'warning'
        }
    };
};