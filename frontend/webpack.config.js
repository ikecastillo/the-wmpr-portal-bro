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
        // Webpack optimizations to reduce bundle size
        optimization: isProduction ? {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    atlaskitVendor: {
                        test: /[\\/]node_modules[\\/]@atlaskit[\\/]/,
                        name: 'atlaskit-vendor',
                        chunks: 'all',
                        priority: 10
                    },
                    commonVendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'common-vendor',
                        chunks: 'all',
                        priority: 5
                    }
                }
            },
            usedExports: true,
            sideEffects: false
        } : {},
        // Configure externals for Jira-provided dependencies
        externals: {
            'react': 'React',
            'react-dom': 'ReactDOM'
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
                locationPrefix: '',
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
            filename: isProduction ? 'bundled.[name].[contenthash:8].js' : 'bundled.[name].js',
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
            maxAssetSize: 300000, // Reduced since we're using externals
            maxEntrypointSize: 500000, 
            hints: 'warning'
        }
    };
};