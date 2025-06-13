import React, { useState, useEffect } from 'react'
import ReactDOM from "react-dom";
import DynamicTable from '@atlaskit/dynamic-table';
import Spinner from '@atlaskit/spinner';
import Lozenge from '@atlaskit/lozenge';

import 'wr-dependency!jira.webresources:util'

// IKKKKKKE-COMPONENT-002 - React Component Loading Check
console.log('[IKKKKKKE-COMPONENT-002] WMPR React Component Module Loading Started');

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

const WMPRRequestsTable: React.FC = () => {
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

// CRITICAL FIX: Enhanced initialization function with comprehensive tracking
const initWMPRRequestsTable = (elementId: string): void => {
    console.log('[IKKKKKKE-INIT-016] ===== INITIALIZATION STARTED =====');
    console.log('[IKKKKKKE-INIT-017] Element ID:', elementId);
    console.log('[IKKKKKKE-INIT-018] React version:', React.version);
    console.log('[IKKKKKKE-INIT-019] ReactDOM available:', typeof ReactDOM);
    console.log('[IKKKKKKE-INIT-020] Global React:', typeof window.React);
    console.log('[IKKKKKKE-INIT-021] Global ReactDOM:', typeof window.ReactDOM);
    
    const container = document.getElementById(elementId);
    if (!container) {
        console.error('[IKKKKKKE-INIT-022] Container element not found:', elementId);
        console.log('[IKKKKKKE-INIT-023] Available elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
    }

    console.log('[IKKKKKKE-INIT-024] Container found:', container);
    console.log('[IKKKKKKE-INIT-025] Container innerHTML before render:', container.innerHTML.substring(0, 100));

    try {
        console.log('[IKKKKKKE-INIT-026] Starting React component render...');
        ReactDOM.render(<WMPRRequestsTable />, container);
        console.log('[IKKKKKKE-INIT-027] ===== REACT COMPONENT RENDERED SUCCESSFULLY =====');
    } catch (error) {
        console.error('[IKKKKKKE-INIT-028] ===== ERROR DURING RENDERING =====');
        console.error('[IKKKKKKE-INIT-029] Error details:', error);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
        
        console.error('[IKKKKKKE-INIT-030] Error stack:', errorStack);
        
        container.innerHTML = '<div style="color: red; padding: 15px; background: #ffebe6; border: 1px solid #ff5630; border-radius: 3px; font-size: 12px;">' +
            '<h4 style="margin: 0 0 10px 0;">React Component Error - IKKKKKKE-INIT-031</h4>' +
            '<strong>Error:</strong> ' + errorMessage + '<br>' +
            '<strong>Type:</strong> ' + typeof error + '<br>' +
            '<details style="margin-top: 10px;"><summary>Stack Trace</summary>' +
            '<pre style="background: #f5f5f5; padding: 5px; margin: 5px 0; font-size: 10px; overflow: auto;">' +
            errorStack +
            '</pre></details>' +
            '</div>';
    }
};

// CRITICAL FIX: Expose function to global window object immediately
(window as any).initWMPRRequestsTable = initWMPRRequestsTable;

console.log('[IKKKKKKE-MODULE-032] ===== MODULE INITIALIZATION =====');
console.log('[IKKKKKKE-MODULE-033] Module loaded successfully');
console.log('[IKKKKKKE-MODULE-034] initWMPRRequestsTable function exposed to window');
console.log('[IKKKKKKE-MODULE-035] Function type check:', typeof (window as any).initWMPRRequestsTable);
console.log('[IKKKKKKE-MODULE-036] Available globals:', Object.keys(window).filter(k => k.includes('WMPR') || k.includes('wmpr')));

// Export for webpack
export default { initWMPRRequestsTable };

console.log('[IKKKKKKE-MODULE-037] Module export completed'); 