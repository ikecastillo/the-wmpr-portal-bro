import React, { useState, useEffect } from 'react'
import ReactDOM from "react-dom";
import DynamicTable from '@atlaskit/dynamic-table';
import Spinner from '@atlaskit/spinner';
import Lozenge from '@atlaskit/lozenge';

import 'wr-dependency!jira.webresources:util'

// IKKKKKKE-COMPONENT-002 - React Component Loading Check
console.log('[IKKKKKKE-COMPONENT-002] WMPR React Component Module Loading Started');

// TypeScript declarations for global objects
declare global {
    interface Window {
        AJS?: {
            AtlasKit?: any;
        };
        WMPR?: any;
        initWMPRRequestsTable?: any;
        define?: any;
    }
    var define: any;
}

interface ServiceDeskRequest {
    key: string;
    summary: string;
    reporter: string;
    created: string;
    status: string;
    statusCategory: string;
}

interface APIResponse {
    data?: ServiceDeskRequest[];
    diagnostics?: {
        requestId: string;
        timestamp: string;
        duration: number;
        user: string;
        jql: string;
        resultCount: number;
        version: string;
    };
    error?: string;
    requestId?: string;
}

// Configuration interface
interface WMPRConfig {
    maxRequests?: number;
    showStatus?: boolean;
    theme?: 'light' | 'dark';
}

// Add Error Boundary for React Components
class WMPRErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null; errorInfo: any }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('[IKKKKKKE-ERROR-BOUNDARY] React Error Caught:', error);
        console.error('[IKKKKKKE-ERROR-BOUNDARY] Error Info:', errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#FFEBE6',
                    border: '2px solid #DE350B',
                    borderRadius: '8px',
                    color: '#DE350B',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <h3>⚠️ React Component Error</h3>
                    <p><strong>Error:</strong> {this.state.error?.message || 'Unknown error'}</p>
                    <details style={{ marginTop: '10px' }}>
                        <summary>Error Details</summary>
                        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '11px', overflow: 'auto' }}>
                            {this.state.error?.stack || 'No stack trace available'}
                        </pre>
                        {this.state.errorInfo && (
                            <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '11px', overflow: 'auto' }}>
                                {JSON.stringify(this.state.errorInfo, null, 2)}
                            </pre>
                        )}
                    </details>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#0052CC',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const WMPRRequestsTable: React.FC<WMPRConfig> = ({ 
    maxRequests = 10, 
    showStatus = true, 
    theme = 'light' 
}) => {
    const [requests, setRequests] = useState<ServiceDeskRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [diagnostics, setDiagnostics] = useState<any>(null);

    console.log('[IKKKKKKE-COMPONENT-003] WMPR React Component Instance Created');

    const fetchRequests = async () => {
        console.log('[WMPR React] Starting fetchRequests...');
        console.log('[IKKKKKKE-API-004] Starting API Request to WMPR Endpoint');
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/rest/wmpr-requests/1.0/recent');
            console.log('[WMPR React] Response status:', response.status);
            console.log('[IKKKKKKE-API-005] API Response Status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data: APIResponse = await response.json();
            console.log('[WMPR React] Response data:', data);
            console.log('[IKKKKKKE-API-006] API Response Data Received:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Handle both old format (array) and new format (object with data property)
            const requestsData = Array.isArray(data) ? data : (data.data || []);
            setRequests(requestsData);
            setDiagnostics(data.diagnostics || null);
            
            console.log('[WMPR React] Successfully loaded', requestsData.length, 'requests');
            console.log('[IKKKKKKE-API-007] Successfully Loaded', requestsData.length, 'requests');
            
        } catch (err) {
            console.error('[WMPR React] Failed to fetch WMPR requests:', err);
            console.error('[IKKKKKKE-API-008] API Request Failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to load requests');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('[WMPR React] Component mounting, starting initial fetch...');
        console.log('[IKKKKKKE-COMPONENT-009] Component Mounting - useEffect Triggered');
        fetchRequests();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            console.log('[WMPR React] Auto-refresh triggered');
            console.log('[IKKKKKKE-COMPONENT-010] Auto-refresh Interval Triggered');
            fetchRequests();
        }, 30000);
        
        return () => {
            console.log('[WMPR React] Component unmounting, clearing interval');
            console.log('[IKKKKKKE-COMPONENT-011] Component Unmounting - Cleanup');
            clearInterval(interval);
        };
    }, []);

    const getStatusLozengeAppearance = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'done':
                return 'success';
            case 'indeterminate':
                return 'inprogress';
            case 'new':
                return 'new';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const head = {
        cells: [
            { key: 'key', content: 'Request', width: 15 },
            { key: 'summary', content: 'Summary', width: 40 },
            { key: 'reporter', content: 'Reporter', width: 20 },
            { key: 'created', content: 'Created', width: 15 },
            { key: 'status', content: 'Status', width: 10 }
        ]
    };

    const rows = requests.map((request, index) => ({
        key: `request-${index}`,
        cells: [
            {
                key: 'key',
                content: (
                    <a 
                        href={`/browse/${request.key}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontWeight: 'bold', textDecoration: 'none' }}
                    >
                        {request.key}
                    </a>
                )
            },
            {
                key: 'summary',
                content: (
                    <span title={request.summary}>
                        {request.summary.length > 50 
                            ? `${request.summary.substring(0, 50)}...` 
                            : request.summary}
                    </span>
                )
            },
            { key: 'reporter', content: request.reporter },
            { key: 'created', content: formatDate(request.created) },
            {
                key: 'status',
                content: (
                    <Lozenge appearance={getStatusLozengeAppearance(request.statusCategory)}>
                        {request.status}
                    </Lozenge>
                )
            }
        ]
    }));

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spinner size="medium" />
                <p style={{ marginTop: '10px' }}>Loading recent WMPR requests...</p>
                <small style={{ color: '#666' }}>IKKKKKKE-RENDER-012: Loading State</small>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                padding: '10px', 
                backgroundColor: '#FFEBE6', 
                border: '1px solid #FF5630',
                borderRadius: '3px',
                color: '#BF2600'
            }}>
                <strong>Error loading WMPR requests:</strong> {error}
                <br />
                <small style={{ color: '#666' }}>IKKKKKKE-RENDER-013: Error State</small>
                <button 
                    onClick={fetchRequests}
                    style={{ 
                        marginLeft: '10px', 
                        padding: '5px 10px', 
                        backgroundColor: '#0052CC',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
                {diagnostics && (
                    <details style={{ marginTop: '10px', fontSize: '11px' }}>
                        <summary>Diagnostic Info</summary>
                        <pre style={{ background: '#f5f5f5', padding: '5px', margin: '5px 0' }}>
                            {JSON.stringify(diagnostics, null, 2)}
                        </pre>
                    </details>
                )}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div style={{ 
                padding: '20px', 
                textAlign: 'center',
                backgroundColor: '#F4F5F7',
                border: '1px solid #DFE1E6',
                borderRadius: '3px'
            }}>
                <p>No recent WMPR requests found.</p>
                <small style={{ color: '#666' }}>IKKKKKKE-RENDER-014: Empty State</small>
                {diagnostics && (
                    <details style={{ marginTop: '10px', fontSize: '11px' }}>
                        <summary>Diagnostic Info</summary>
                        <pre style={{ background: '#f5f5f5', padding: '5px', margin: '5px 0' }}>
                            {JSON.stringify(diagnostics, null, 2)}
                        </pre>
                    </details>
                )}
            </div>
        );
    }

    return (
        <div style={{ marginTop: '10px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px',
                padding: '5px 0'
            }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                    Recent WMPR Service Desk Requests ({requests.length})
                    <br />
                    <small style={{ color: '#666', fontWeight: 'normal' }}>IKKKKKKE-RENDER-015: Success State</small>
                    {diagnostics && (
                        <span style={{ fontSize: '10px', color: '#666', fontWeight: 'normal' }}>
                            {' '}(ID: {diagnostics.requestId}, {diagnostics.duration}ms)
                        </span>
                    )}
                </h4>
                <button 
                    onClick={fetchRequests}
                    disabled={loading}
                    style={{ 
                        padding: '3px 8px', 
                        fontSize: '11px',
                        backgroundColor: '#F4F5F7',
                        border: '1px solid #DFE1E6',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                >
                    Refresh
                </button>
            </div>
            <DynamicTable
                head={head}
                rows={rows}
                isFixedSize
                defaultSortKey="created"
                defaultSortOrder="DESC"
            />
            {diagnostics && (
                <details style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
                    <summary>Diagnostic Info</summary>
                    <pre style={{ background: '#f5f5f5', padding: '5px', margin: '5px 0', fontSize: '9px' }}>
                        {JSON.stringify(diagnostics, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
};

// Render the component
const initWMPRRequestsTable = (containerId: string, config: WMPRConfig = {}) => {
    try {
        console.log('[WMPR-REQUESTS-003] Initializing WMPR Requests Table', { containerId, config });
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[WMPR-REQUESTS-004] Container not found:', containerId);
            return null;
        }

        // Use React 16 compatible ReactDOM.render
        ReactDOM.render(<WMPRErrorBoundary><WMPRRequestsTable {...config} /></WMPRErrorBoundary>, container);
        
        console.log('[WMPR-REQUESTS-005] Component rendered successfully');
        return { container };
    } catch (error) {
        console.error('[WMPR-REQUESTS-006] Error initializing component:', error);
        return null;
    }
};

// CRITICAL: Multiple exposure strategies to ensure the function is always available
declare global {
    interface Window {
        initWMPRRequestsTable?: any;
        WMPR?: any;
        wmprRequestsTable?: any;
    }
}

// Immediate global exposure
if (typeof window !== 'undefined') {
    // Strategy 1: Direct window exposure
    window.initWMPRRequestsTable = initWMPRRequestsTable;
    window.wmprRequestsTable = initWMPRRequestsTable;
    
    // Strategy 2: WMPR namespace
    if (!window.WMPR) {
        window.WMPR = {};
    }
    window.WMPR.initWMPRRequestsTable = initWMPRRequestsTable;
    window.WMPR.wmprRequestsTable = initWMPRRequestsTable;
    
    console.log('[WMPR-REQUESTS-007] Global functions exposed:', {
        'window.initWMPRRequestsTable': typeof window.initWMPRRequestsTable,
        'window.wmprRequestsTable': typeof window.wmprRequestsTable,
        'window.WMPR.initWMPRRequestsTable': typeof window.WMPR?.initWMPRRequestsTable,
        'window.WMPR.wmprRequestsTable': typeof window.WMPR?.wmprRequestsTable
    });
}

// Export for module systems
export default initWMPRRequestsTable;
export { initWMPRRequestsTable };

// DIAGNOSTIC: Bundle loading verification
console.log('[WMPR-REQUESTS-008] WMPR Requests Table bundle loaded successfully', {
    timestamp: new Date().toISOString(),
    React: typeof window.React,
    ReactDOM: typeof window.ReactDOM,
    initFunction: typeof initWMPRRequestsTable
}); 