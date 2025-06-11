const path = require('path');
const WrmPlugin = require('atlassian-webresource-webpack-plugin');

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
            'wmprRequestsTable': './src/wmpr-requests-table.tsx'
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
        // External dependencies (leverage Jira's built-in libraries)
        externals: {
            'react': 'React',
            'react-dom': 'ReactDOM'
        },
        plugins: [
            new WrmPlugin({
                watch,
                locationPrefix: 'frontend/',
                pluginKey: 'com.example.wmpr.backend',
                xmlDescriptors: xmlOutPath,
                contextMap: {
                    'wmprRequestsTable': 'servicedesk.portal.footer'
                },
                // External web resources that Jira already provides
                providedDependencies: {
                    'react': {
                        dependency: 'jira.webresources:util',
                        import: 'React'
                    },
                    'react-dom': {
                        dependency: 'jira.webresources:util', 
                        import: 'ReactDOM'
                    }
                }
            }),
        ],
        output: {
            filename: isProduction ? 'bundled.[name].[contenthash:8].js' : 'bundled.[name].js',
            path: path.resolve("../backend/src/main/resources/frontend"),
            // Ensure proper chunk loading
            chunkLoadingGlobal: 'webpackChunkWMPR'
        },
        // Performance budgets to catch large bundles
        performance: {
            maxAssetSize: 250000, // 250KB limit
            maxEntrypointSize: 400000, // Increased for multiple chunks
            hints: 'warning'
        }
    };
};