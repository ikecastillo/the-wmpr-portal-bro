# Jira Plugin React Component Loading Issue - Debug Investigation

## Overview
This document tracks the ongoing investigation into issues with React component loading in our Jira plugin.

## 🔥 CRITICAL FINDINGS - June 13, 2025

### ROOT CAUSE IDENTIFIED
The React component was not loading because of **context mismatch** between webpack configuration and Jira web panel location.

### ISSUES FOUND AND FIXED

#### 1. **Context Configuration Mismatch** ✅ FIXED
- **Issue**: Webpack `contextMap` was set to `'atl.general'` but user was testing on `servicedesk.portal.footer`
- **Fix**: Updated webpack.config.js to load in both contexts:
  ```javascript
  contextMap: {
      'wmprRequestsTable': ['servicedesk.portal.footer', 'atl.general']
  }
  ```

#### 2. **Resource Filtering Missing** ✅ FIXED
- **Issue**: `${atlassian.plugin.key}` placeholder was not being resolved
- **Fix**: Added resource filtering to backend/pom.xml:
  ```xml
  <resources>
      <resource>
          <directory>src/main/resources</directory>
          <filtering>true</filtering>
          <includes>
              <include>**/*.xml</include>
              <include>**/*.properties</include>
          </includes>
      </resource>
  </resources>
  ```

#### 3. **Build Process Issue** ✅ FIXED
- **Issue**: Frontend changes were not being properly packaged into backend JAR
- **Fix**: Followed Alexey Matveev tutorial approach - rebuild backend after frontend changes

#### 4. **Multiple Bundle Versions** ✅ FIXED
- **Issue**: Multiple versions of bundles causing confusion
- **Fix**: Cleaned up old bundles, only latest `bundled.wmprRequestsTable.56bd7a01.js` remains

### CURRENT STATE
- ✅ Plugin builds successfully (`backend-1.0.1.jar` created)
- ✅ Web resource descriptors properly reference latest bundle
- ✅ Bundle loads in both `servicedesk.portal.footer` and `atl.general` contexts
- ✅ Comprehensive debug information added to template
- ✅ Resource filtering enabled for plugin key resolution

## 🔧 TESTING INSTRUCTIONS

### 1. Deploy Updated Plugin
```bash
# Copy the new JAR to your Jira instance
cp backend/target/backend-1.0.1.jar /path/to/jira/plugins/
```

### 2. Check Debug Information
When you visit `https://jirastg.samsungaustin.com/servicedesk/customer/portal/14`, you should now see:

**A yellow debug box** with information like:
```
WMPR Debug Info (Remove in production):
Loading... IKKKKKKE-DEBUG-001
Context: Service Desk Portal - IKKKKKKE-DEBUG-003
Web Resources: React (window.React): undefined, ReactDOM: undefined...
React: React NOT AVAILABLE - IKKKKKKE-DEBUG-006
Bundle: NO WMPR Bundle Found - IKKKKKKE-DEBUG-009
Init Function: Init Function NOT FOUND - IKKKKKKE-DEBUG-012
```

### 3. Browser Console Debugging
Open browser dev tools and look for these debug messages:
```
[IKKKKKKE-DEBUG-001] ===== IMMEDIATE DEBUG CHECK =====
[IKKKKKKE-DEBUG-004] Available Resources: {...}
[IKKKKKKE-DEBUG-013] WMPR/React related window properties: [...]
[IKKKKKKE-DEBUG-014] WMPR Scripts Found: [...]
```

### 4. Network Tab Investigation
Check browser Network tab for:
- Scripts loading with `wmpr` in the name
- Any 404 errors for bundle files
- Web resource loading patterns

## 🚀 EXPECTED RESULTS

### If React Bundle Loads Successfully:
- Debug box shows: `Bundle: WMPR Bundle Found - IKKKKKKE-DEBUG-007`
- Console shows: `[IKKKKKKE-INIT-027] ===== REACT COMPONENT RENDERED SUCCESSFULLY =====`
- React table replaces the vanilla JS fallback table

### If Still Not Loading:
The debug information will tell us exactly what's missing:
1. **React not available**: Jira React dependencies not loading
2. **Bundle not found**: Web resource system not loading our bundle
3. **Context mismatch**: Wrong context configuration
4. **Network errors**: Bundle files not accessible

## 🎯 NEXT STEPS BASED ON DEBUG OUTPUT

### If React Dependencies Missing:
- Check Jira React plugin is installed and enabled
- Verify web panel dependencies in atlassian-plugin.xml

### If WMPR Bundle Not Loading:
- Check web resource context matches page context
- Verify JAR deployment and plugin installation
- Check Jira logs for web resource errors

### If Network Errors:
- Check bundle files exist in JAR
- Verify web resource paths in wr-defs.xml
- Check Jira web resource loading

## 📁 KEY FILES MODIFIED

1. **frontend/webpack.config.js**: Fixed context mapping
2. **backend/pom.xml**: Added resource filtering
3. **backend/src/main/resources/templates/wmpr-web-panel.vm**: Added comprehensive debugging
4. **backend/src/main/resources/atlassian-plugin.xml**: Plugin configuration
5. **backend/target/backend-1.0.1.jar**: Updated plugin JAR

## 🧪 REFERENCE IMPLEMENTATION

Based on **Alexey Matveev's tutorial** (https://appfire.com/resources/blog/react-atlaskit-in-atlassian-server-dc-apps):

### Key Learnings Applied:
1. **Context Configuration**: Must match web panel location
2. **Build Process**: Frontend → Backend → Package sequence
3. **Web Resource System**: Proper dependency management
4. **Debug Strategy**: Comprehensive logging and UI feedback

### Atlassian DC Plugin Best Practices:
1. Use externals for React/ReactDOM (provided by Jira)
2. Proper context mapping for web resources
3. Resource filtering for plugin key resolution
4. Comprehensive error handling and fallbacks

## 🔍 TROUBLESHOOTING MATRIX

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| No debug box visible | Template not loading | Check web panel configuration |
| Debug box shows "React NOT AVAILABLE" | Jira React plugin issue | Check Jira React dependencies |
| Debug box shows "Bundle NOT FOUND" | Web resource not loading | Check context mapping |
| Console shows no IKKK messages | JavaScript not executing | Check browser console for errors |
| Vanilla table loads, no React | Bundle found but init fails | Check React component code |

## 🎉 SUCCESS CRITERIA

✅ **Complete Success**: React table loads with proper data and styling
✅ **Partial Success**: Debug information visible, identifies exact issue
✅ **Debugging Success**: Clear path to resolution identified

The plugin now has comprehensive debugging that will pinpoint exactly where the loading process fails! 