import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Spinner from '@atlaskit/spinner';
import Lozenge from '@atlaskit/lozenge';

import 'wr-dependency!jira.webresources:util'

// SIMPLE SETTINGS COMPONENT FOR TESTING
console.log('[WMPR-SETTINGS-COMPONENT-001] ===== WMPR Settings Component Loading =====');

// TypeScript declarations for global objects
declare global {
    interface Window {
        AJS?: {
            AtlasKit?: any;
        };
        WMPR?: any;
        initWMPRSettings?: any;
        WMPR_wmprSettings?: any;
        define?: any;
    }
    var define: any;
}

// Add Error Boundary for React Components
class WMPRSettingsErrorBoundary extends React.Component<
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
        console.error('[WMPR-SETTINGS-ERROR-BOUNDARY] React Error Caught:', error);
        console.error('[WMPR-SETTINGS-ERROR-BOUNDARY] Error Info:', errorInfo);
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
                    <h3>⚠️ React Settings Component Error</h3>
                    <p><strong>Error:</strong> {this.state.error?.message || 'Unknown error'}</p>
                    <details style={{ marginTop: '10px' }}>
                        <summary>Error Details</summary>
                        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '11px', overflow: 'auto' }}>
                            {this.state.error?.stack || 'No stack trace available'}
                        </pre>
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

interface WMPRSettingsTestProps {
    message?: string;
}

const WMPRSettingsTest: React.FC<WMPRSettingsTestProps> = ({ message = "WMPR Settings" }) => {
    const [clickCount, setClickCount] = useState(0);
    const [showSpinner, setShowSpinner] = useState(false);

    console.log('[WMPR-SETTINGS-COMPONENT-002] Component rendering, click count:', clickCount);

    const handleClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        setShowSpinner(true);
        console.log('[WMPR-SETTINGS-COMPONENT-003] Button clicked! Count:', newCount);
        
        // Auto-hide spinner after 2 seconds
        setTimeout(() => setShowSpinner(false), 2000);
    };

    const buttonStyle = {
        backgroundColor: '#0052CC',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '12px 24px',
        fontSize: '16px',
        cursor: 'pointer',
        marginBottom: '10px',
        minHeight: '44px',
        fontWeight: 'bold'
    };

    const warningButtonStyle = {
        backgroundColor: '#FF8B00',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '10px 20px',
        fontSize: '14px',
        cursor: 'pointer',
        fontWeight: 'bold'
    };

    return (
        <div style={{
            padding: '20px',
            border: '3px solid #0052CC',
            borderRadius: '8px',
            backgroundColor: '#E6F3FF',
            margin: '20px 0',
            textAlign: 'center'
        }}>
            <h2 style={{ 
                color: '#0052CC', 
                fontSize: '24px', 
                marginBottom: '15px',
                fontWeight: 'bold'
            }}>
                🎉 REACT IS WORKING! 🎉
            </h2>
            
            <p style={{ 
                fontSize: '16px', 
                marginBottom: '20px',
                color: '#172B4D'
            }}>
                This is a React component with AtlasKit! Settings: {message}
            </p>
            
            <div style={{ marginBottom: '15px' }}>
                <button 
                    style={buttonStyle}
                    onClick={handleClick}
                >
                    🚀 I'M A REACT BUTTON! (Clicked: {clickCount})
                </button>
            </div>
            
            <div style={{ marginTop: '15px' }}>
                <button 
                    style={warningButtonStyle}
                    onClick={() => alert('React Alert! React + AtlasKit = ✅')}
                >
                    🔥 REACT ALERT TEST
                </button>
            </div>

            <div style={{ 
                marginTop: '20px', 
                padding: '10px', 
                backgroundColor: '#00A86B', 
                color: 'white',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
            }}>
                <Lozenge appearance="success">SUCCESS</Lozenge>
                <span>React + AtlasKit Components Loaded!</span>
            </div>

            {showSpinner && (
                <div style={{ 
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#FFF3CD',
                    border: '1px solid #FFC107',
                    borderRadius: '4px'
                }}>
                    <div style={{ marginBottom: '10px' }}>
                        <Spinner size="medium" />
                    </div>
                    <p style={{ margin: 0, color: '#856404' }}>
                        ✅ AtlasKit Spinner Working! Button clicked {clickCount} times.
                    </p>
                </div>
            )}
        </div>
    );
};

// INITIALIZATION FUNCTION FOR SETTINGS PAGE
const initWMPRSettings = (containerId: string, message?: string): void => {
    console.log('[WMPR-SETTINGS-INIT-004] ===== INITIALIZING WMPR SETTINGS =====');
    console.log('[WMPR-SETTINGS-INIT-005] Container ID:', containerId);
    console.log('[WMPR-SETTINGS-INIT-006] Message:', message);
    console.log('[WMPR-SETTINGS-INIT-007] React version:', React.version);
    console.log('[WMPR-SETTINGS-INIT-008] ReactDOM available:', typeof ReactDOM);
    
    // Enhanced dependency checking
    console.log('[WMPR-SETTINGS-INIT-008a] AtlasKit Spinner:', typeof Spinner);
    console.log('[WMPR-SETTINGS-INIT-008b] AtlasKit Lozenge:', typeof Lozenge);
    
    // Check for alternative AtlasKit paths
    if (typeof window.AJS !== 'undefined' && window.AJS?.AtlasKit) {
        console.log('[WMPR-SETTINGS-INIT-008c] AJS.AtlasKit available:', Object.keys(window.AJS.AtlasKit));
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('[WMPR-SETTINGS-INIT-009] ❌ Container not found:', containerId);
        console.log('[WMPR-SETTINGS-INIT-010] Available elements:', 
            Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
    }

    console.log('[WMPR-SETTINGS-INIT-011] ✅ Container found:', container);
    
    try {
        console.log('[WMPR-SETTINGS-INIT-012] Starting React render...');
        ReactDOM.render(
            <WMPRSettingsErrorBoundary>
                <WMPRSettingsTest message={message} />
            </WMPRSettingsErrorBoundary>, 
            container
        );
        console.log('[WMPR-SETTINGS-INIT-013] ✅ ===== REACT COMPONENT RENDERED SUCCESSFULLY =====');
    } catch (error) {
        console.error('[WMPR-SETTINGS-INIT-014] ❌ ===== REACT RENDER ERROR =====');
        console.error('[WMPR-SETTINGS-INIT-015] Error details:', error);
        
        // Fallback error display
        container.innerHTML = `
            <div style="
                background: #FFEBE6; 
                border: 2px solid #DE350B; 
                padding: 20px; 
                border-radius: 8px;
                color: #DE350B;
                font-family: Arial, sans-serif;
                margin: 20px 0;
            ">
                <h3>❌ React Component Error</h3>
                <p><strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}</p>
                <p><strong>Container:</strong> ${containerId}</p>
                <p><strong>React Available:</strong> ${typeof React !== 'undefined'}</p>
                <p><strong>ReactDOM Available:</strong> ${typeof ReactDOM !== 'undefined'}</p>
            </div>
        `;
    }
};

// Global exposure for multiple access patterns
if (typeof window !== 'undefined') {
    // Strategy 1: Direct window exposure
    window.initWMPRSettings = initWMPRSettings;
    
    // Strategy 2: WMPR namespace
    if (!window.WMPR) {
        window.WMPR = {};
    }
    window.WMPR.initWMPRSettings = initWMPRSettings;
    
    // Strategy 3: New webpack library exposure pattern
    window.WMPR_wmprSettings = initWMPRSettings;
    
    console.log('[WMPR-SETTINGS-007] Global functions exposed:', {
        'window.initWMPRSettings': typeof window.initWMPRSettings,
        'window.WMPR.initWMPRSettings': typeof window.WMPR?.initWMPRSettings,
        'window.WMPR_wmprSettings': typeof window.WMPR_wmprSettings
    });
}

// AMD/RequireJS compatibility
if (typeof window.define === 'function' && window.define.amd) {
    window.define('wmpr-settings', [], function() {
        return { initWMPRSettings };
    });
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initWMPRSettings };
}

console.log('[WMPR-SETTINGS-MODULE-016] ===== MODULE LOADED =====');
console.log('[WMPR-SETTINGS-MODULE-017] initWMPRSettings function exposed');
console.log('[WMPR-SETTINGS-MODULE-018] Function available:', typeof (window as any).initWMPRSettings);

console.log('[WMPR-SETTINGS-MODULE-019] ===== MODULE EXPORT COMPLETE ====='); 