# Jira Plugin React Component Loading Issue - Debug Investigation

## Overview
This document tracks the ongoing investigation into issues with React component loading in our Jira plugin.

## Current Status
The plugin is experiencing issues with properly loading its React component, despite having proper configurations in place.

## Key Investigation Points

### 1. Documentation
- A comprehensive Jira plugin development guide has been recently added/updated (`JIRA_PLUGIN_GUIDE.md`)
- The guide contains updated best practices and configuration details

### 2. Core Issues Identified
The investigation has revealed several potential areas of concern:

- Multiple versions of bundled JavaScript files present in `frontend/` directory
- Webpack build generating multiple versions of the same bundle with different hashes
- Possible timing issues with resource loading

### 3. Configuration Verification

#### Web Resource Definitions
- `wr-defs.xml` has been verified to contain:
  - Proper entrypoint configuration
  - Correct web resource definitions

#### Template Implementation
- `wmpr-web-panel.vm` includes:
  - Extensive error handling mechanisms
  - Fallback implementations
  - React component loading with retry logic
  - Fallback to vanilla JavaScript when needed

### 4. Build Process
- Maven build logs indicate successful dependency resolution from Atlassian repositories
- Webpack configuration may need review due to multiple bundle generation

## Potential Root Causes

1. **Bundle Conflicts**
   - Multiple versions of bundled JavaScript files may be causing loading conflicts
   - Need to investigate webpack output and bundling strategy

2. **Resource Loading Timing**
   - Possible race conditions in resource loading
   - Current retry mechanism may need optimization

3. **Build Configuration**
   - Webpack configuration may need adjustment to prevent multiple bundle generation
   - Need to review bundling strategy and output management

## Next Steps

1. Review webpack configuration to address multiple bundle generation
2. Analyze resource loading sequence and timing
3. Investigate potential conflicts between bundled versions
4. Consider implementing more robust loading detection mechanisms

## Status
**COMPLETED - Issues Identified and Fixed**

## Fixes Applied

### 1. Removed Conflicting Dependencies
- **Issue**: Web panel had conflicting dependencies (`wmpr-custom-styles` and `wmpr-custom-scripts`) that prevented React component loading
- **Fix**: Removed conflicting dependencies from `atlassian-plugin.xml` web panel configuration
- **File**: `backend/src/main/resources/atlassian-plugin.xml`

### 2. Cleaned Up Multiple Bundle Versions
- **Issue**: Multiple versions of bundled JavaScript files causing resource conflicts
- **Fix**: Removed all old bundle versions, keeping only the current ones:
  - `bundled.wmprRequestsTable.4bbc145b.js`
  - `bundled.atlaskit-vendor.b479f3d7.js` 
  - `bundled.common-vendor.a2d72fa4.js`
- **Directory**: `backend/src/main/resources/frontend/`

### 3. Updated Web Resource Definitions
- **Issue**: Web resource definitions automatically updated to reference correct bundle files
- **Fix**: Build process automatically updated `wr-defs.xml` to reference new bundle
- **File**: `backend/src/main/resources/META-INF/plugin-descriptors/wr-defs.xml`

### 4. Verified React Component Integration
- **Verification**: Confirmed that `initWMPRRequestsTable` function is properly exposed in the bundle
- **Integration**: React component properly exports initialization function to window object

## Expected Results
With these fixes, the WMPR React component should now:
1. Load without dependency conflicts
2. Successfully initialize with `initWMPRRequestsTable` function
3. Render the service desk requests table in the portal footer
4. Handle API calls to `/rest/wmpr-requests/1.0/recent` properly

## Testing Recommendations
1. Deploy the updated plugin to Jira instance
2. Check browser console for successful component initialization
3. Verify network requests for the correct bundle files
4. Confirm React component renders in the service desk portal footer 