# 📚 Complete Guide to Jira Plugin Development
## Understanding the WMPR Service Desk Requests Table Plugin

This guide explains how Jira plugins work, using our WMPR Service Desk Requests Table as a practical example. You'll learn about the backend-frontend architecture, Java concepts, and how everything connects together.

---

## 🎯 What We Built

**Goal**: Display the 10 most recent WMPR Service Desk requests in a table at the bottom of the Service Desk portal.

**Solution**: A Jira plugin with:
- **Backend**: Java REST API that fetches WMPR requests from Jira
- **Frontend**: React table component that displays the data
- **Integration**: Web panel that appears in the Service Desk footer

---

## 🏗️ Overall Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Jira User     │    │  Service Desk   │    │  WMPR Project   │
│                 │───▶│     Portal      │───▶│    Issues       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │   Web Panel     │ ◀── Displays in footer
                    │  (Footer Area)  │
                    └─────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │ React Component │ ◀── Our table component
                    │    (Frontend)   │
                    └─────────────────┘
                               │
                               ▼ HTTP Request
                    ┌─────────────────┐
                    │  REST Endpoint  │ ◀── Our Java backend
                    │   (Backend)     │
                    └─────────────────┘
                               │
                               ▼ JQL Query
                    ┌─────────────────┐
                    │   Jira Search   │ ◀── Finds WMPR issues
                    │     Service     │
                    └─────────────────┘
```

---

## 📁 Project Structure Explained

```
wmpr-requests-plugin/               # Root project
├── pom.xml                        # Maven parent configuration
├── frontend/                      # React frontend module
│   ├── pom.xml                   # Frontend build configuration
│   ├── package.json              # NPM dependencies (React, AtlasKit)
│   ├── webpack.config.js         # Bundles React code for Jira
│   └── src/
│       └── wmpr-requests-table.tsx # Our React table component
└── backend/                       # Java backend module
    ├── pom.xml                   # Backend dependencies (Jira APIs)
    ├── src/main/
    │   ├── java/com/example/wmpr/
    │   │   ├── rest/             # REST endpoints
    │   │   ├── model/            # Data classes
    │   │   └── webpanel/         # Web panel logic
    │   └── resources/
    │       ├── atlassian-plugin.xml  # Plugin configuration
    │       ├── templates/            # HTML/Velocity templates
    │       └── META-INF/            # Generated web resources
```

---

## 🔧 Maven: The Build System

### What is Maven?
Maven is a build tool that:
- **Manages Dependencies**: Downloads Java libraries automatically
- **Builds Projects**: Compiles Java code, bundles resources
- **Multi-Module Projects**: Coordinates frontend + backend builds

### Parent POM (`pom.xml`)
```xml
<groupId>com.example.wmpr</groupId>
<artifactId>wmpr-requests-plugin</artifactId>
<version>1.0.0</version>
<packaging>pom</packaging>  <!-- Parent project -->

<modules>
    <module>frontend</module>    <!-- React build -->
    <module>backend</module>     <!-- Java plugin -->
</modules>
```

**What this does:**
- Creates a parent project that coordinates two sub-projects
- When you run `atlas-mvn package`, it builds both frontend and backend
- Frontend builds first (React → JavaScript), then backend includes the result

---

## ☕ Java Backend Deep Dive

### 1. Plugin Framework (`atlassian-plugin.xml`)

This is the **plugin's brain** - it tells Jira what your plugin provides:

```xml
<atlassian-plugin key="com.example.wmpr.backend" name="WMPR Service Desk Requests Plugin">
  
  <!-- Web Panel: Adds our table to Service Desk footer -->
  <web-panel location="servicedesk.portal.footer" key="wmpr-requests-panel" 
             class="com.example.wmpr.webpanel.WMPRRequestsWebPanel">
    <resource name="view" type="velocity" location="/templates/wmpr-web-panel.vm"/>
  </web-panel>
  
  <!-- REST API: Creates /rest/wmpr-requests/1.0/recent endpoint -->
  <rest name="WMPR Requests REST" path="/wmpr-requests" version="1.0">
    <package>com.example.wmpr.rest</package>
  </rest>
  
</atlassian-plugin>
```

**Key Concepts:**
- **Web Panel**: A UI component that appears in specific Jira locations
- **REST Module**: Exposes HTTP endpoints for frontend to call
- **Location**: `servicedesk.portal.footer` means "bottom of Service Desk pages"

### 2. Dependency Injection with Spring

Java uses **Spring Framework** for dependency injection:

```java
@Path("/recent")
public class WMPRRequestsRestResource {

    @JiraImport  // ← Tells Spring: "Give me Jira's search service"
    private final SearchService searchService;
    
    @JiraImport  // ← Tells Spring: "Give me current user info"
    private final JiraAuthenticationContext authenticationContext;

    @Inject  // ← Constructor injection
    public WMPRRequestsRestResource(
            SearchService searchService,
            JiraAuthenticationContext authenticationContext) {
        this.searchService = searchService;
        this.authenticationContext = authenticationContext;
    }
}
```

**What Spring Does:**
- **Automatic Wiring**: You don't create objects manually
- **Jira Integration**: `@JiraImport` gives you access to Jira's internal services
- **Lifecycle Management**: Spring creates/destroys objects as needed

### 3. REST Endpoints with JAX-RS

JAX-RS creates HTTP endpoints using annotations:

```java
@Path("/recent")  // ← URL path: /rest/wmpr-requests/1.0/recent
public class WMPRRequestsRestResource {

    @GET  // ← HTTP GET method
    @Produces(MediaType.APPLICATION_JSON)  // ← Returns JSON
    public Response getRecentWMPRRequests() {
        
        // 1. Get current user
        ApplicationUser user = authenticationContext.getLoggedInUser();
        
        // 2. Build JQL query
        String jql = "project = WMPR ORDER BY created DESC";
        
        // 3. Execute search
        SearchService.ParseResult parseResult = searchService.parseQuery(user, jql);
        SearchResults results = searchService.search(user, parseResult.getQuery(), pagerFilter);
        
        // 4. Convert to JSON and return
        return Response.ok(gson.toJson(requests)).build();
    }
}
```

**Flow:**
1. Frontend makes HTTP GET to `/rest/wmpr-requests/1.0/recent`
2. JAX-RS routes to this method
3. Method queries Jira using JQL (Jira Query Language)
4. Results converted to JSON and sent back

### 4. Data Models (POJOs)

Simple Java classes that represent data:

```java
public class ServiceDeskRequest {
    private String key;        // WMPR-123
    private String summary;    // "Fix printer issue"
    private String reporter;   // "John Smith"
    private String created;    // "2024-01-15"
    private String status;     // "In Progress"
    
    // Getters and setters...
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
}
```

**Purpose:**
- **Data Structure**: Organizes information in a consistent way
- **JSON Conversion**: Gson automatically converts these to/from JSON
- **Type Safety**: Compiler catches errors if you misuse data

### 5. Web Panel Logic

Provides context data to templates:

```java
@Scanned  // ← Spring finds this class automatically
public class WMPRRequestsWebPanel extends AbstractJiraContextProvider {

    @Override
    public Map<String, Object> getContextMap(ApplicationUser user, JiraHelper jiraHelper) {
        Map<String, Object> context = super.getContextMap(user, jiraHelper);
        
        // Add data that templates can use
        context.put("currentUser", user);
        context.put("baseUrl", jiraHelper.getRequest().getContextPath());
        
        return context;
    }
}
```

---

## ⚛️ React Frontend Deep Dive

### 1. Modern JavaScript with TypeScript

Our React component uses modern JavaScript features:

```typescript
// TypeScript interface for type safety
interface ServiceDeskRequest {
    key: string;
    summary: string;
    reporter: string;
    created: string;
    status: string;
    statusCategory: string;
}

// React functional component with hooks
const WMPRRequestsTable: React.FC = () => {
    // State management with hooks
    const [requests, setRequests] = useState<ServiceDeskRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
```

**Key Concepts:**
- **TypeScript**: Adds type safety to JavaScript
- **React Hooks**: `useState` manages component state
- **Functional Components**: Modern React pattern (vs class components)

### 2. Data Fetching with Fetch API

```typescript
const fetchRequests = async () => {
    try {
        setLoading(true);
        const response = await fetch('/rest/wmpr-requests/1.0/recent');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setRequests(data);
        setError(null);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
        setLoading(false);
    }
};
```

**Flow:**
1. **Async/Await**: Modern JavaScript for handling promises
2. **HTTP Request**: Calls our Java REST endpoint
3. **Error Handling**: Gracefully handles network/server errors
4. **State Updates**: Updates component state to trigger re-render

### 3. AtlasKit Integration

AtlasKit provides Jira-styled components:

```typescript
import DynamicTable from '@atlaskit/dynamic-table';
import Spinner from '@atlaskit/spinner';
import Lozenge from '@atlaskit/lozenge';

// Using AtlasKit components
<DynamicTable
    head={head}           // Column definitions
    rows={rows}           // Table data
    isFixedSize           // Performance optimization
    defaultSortKey="created"
    defaultSortOrder="DESC"
/>
```

**Benefits:**
- **Consistent UI**: Looks like native Jira components
- **Accessibility**: Built-in keyboard navigation, screen reader support
- **Performance**: Optimized for large datasets

### 4. Component Lifecycle

```typescript
useEffect(() => {
    fetchRequests();  // Load data when component mounts
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);  // Cleanup when component unmounts
}, []);  // Empty dependency array = run once on mount
```

---

## 🔌 Frontend-Backend Integration

### 1. Velocity Templates

Bridge between Java backend and React frontend:

```velocity
$webResourceManager.requireResourcesForContext("com.example.wmpr.backend:entrypoint-wmprRequestsTable")

<div id="wmpr-requests-container">
    <div id="wmpr-requests-table-root">
        <!-- React component renders here -->
    </div>
</div>

<script type="application/javascript">
    AJS.toInit(function() {
        window.initWMPRRequestsTable('wmpr-requests-table-root');
    });
</script>
```

**What happens:**
1. **Web Resource Loading**: Tells Jira to load our bundled React code
2. **DOM Container**: Creates a `<div>` where React will render
3. **Initialization**: Calls our React component's init function

### 2. Webpack Build Process

Webpack bundles React code for Jira:

```javascript
module.exports = {
    entry: {
        'wmprRequestsTable': './src/wmpr-requests-table.tsx'  // Input
    },
    plugins: [
        new WrmPlugin({
            pluginKey: 'com.example.wmpr.backend',
            contextMap: {
                'wmprRequestsTable': 'servicedesk.portal.footer'  // Where to load
            }
        })
    ],
    output: {
        filename: 'bundled.[name].js',  // Output file
        path: '../backend/src/main/resources/frontend'  // Backend includes this
    }
};
```

**Build Flow:**
1. **TypeScript → JavaScript**: Converts modern JS to browser-compatible code
2. **Bundling**: Combines all dependencies into single file
3. **Web Resource Definition**: Creates XML that Jira understands
4. **Backend Integration**: Places files where Java plugin can serve them

### 3. Web Resource System

Jira's way of managing JavaScript/CSS:

```xml
<!-- Generated by Webpack -->
<web-resource key="entrypoint-wmprRequestsTable" name="wmprRequestsTable">
    <resource type="download" name="bundled.wmprRequestsTable.js" location="frontend/bundled.wmprRequestsTable.js"/>
    <context>servicedesk.portal.footer</context>
</web-resource>
```

**Context System:**
- **Context**: Tells Jira when to load the JavaScript
- **Location**: Where in the UI the component should appear
- **Dependencies**: Automatically loads required libraries

---

## 🔄 Complete Request Flow

Let's trace what happens when a user views the Service Desk portal:

### 1. Initial Page Load
```
User opens Service Desk portal
         ↓
Jira renders the page structure
         ↓
Jira sees web-panel with location="servicedesk.portal.footer"
         ↓
Jira calls WMPRRequestsWebPanel.getContextMap()
         ↓
Jira renders wmpr-web-panel.vm template
         ↓
Template includes web resource "entrypoint-wmprRequestsTable"
         ↓
Jira loads bundled.wmprRequestsTable.js
         ↓
JavaScript executes: window.initWMPRRequestsTable()
         ↓
React component mounts and renders loading state
```

### 2. Data Fetching
```
React component calls fetchRequests()
         ↓
Browser makes GET request to /rest/wmpr-requests/1.0/recent
         ↓
JAX-RS routes to WMPRRequestsRestResource.getRecentWMPRRequests()
         ↓
Java code gets current user from JiraAuthenticationContext
         ↓
Java code builds JQL: "project = WMPR ORDER BY created DESC"
         ↓
Java code calls SearchService.search() with PagerFilter(limit=10)
         ↓
Jira executes JQL query against database
         ↓
Results converted to ServiceDeskRequest objects
         ↓
Gson converts objects to JSON
         ↓
HTTP response sent back to React
         ↓
React updates state and re-renders table with data
```

### 3. Auto-refresh
```
setInterval(fetchRequests, 30000) triggers every 30 seconds
         ↓
Repeats data fetching flow
         ↓
React updates UI if data changed
```

---

## 🛠️ Development Workflow

### 1. Backend Development
```bash
# Make Java changes
cd backend/
# Test compilation
atlas-mvn compile
# Run with hot reload
atlas-mvn jira:run
```

### 2. Frontend Development
```bash
# Make React changes
cd frontend/
# Install dependencies
npm install
# Build for Jira
npm run build
```

### 3. Full Plugin Build
```bash
# From project root
atlas-mvn package
# Creates: backend/target/backend-1.0.0.jar
```

### 4. Testing Cycle
```bash
# Start Jira with plugin
atlas-mvn jira:run
# Jira starts at http://localhost:2990/jira
# Login: admin/admin
# Test your changes
```

---

## 🐛 Common Issues & Solutions

### 1. "Missing artifact" errors
**Problem**: Maven can't find Atlassian dependencies
```bash
# Solution: Add Atlassian repository
atlas-mvn dependency:purge-local-repository
atlas-mvn compile
```

### 2. React component not loading
**Problem**: Web resource not found
- Check webpack.config.js pluginKey matches atlassian-plugin.xml
- Verify bundled files exist in `backend/src/main/resources/frontend/`
- Check browser console for JavaScript errors

### 3. REST endpoint 404
**Problem**: JAX-RS not finding endpoint
- Verify `@Path` annotations
- Check package name in atlassian-plugin.xml REST module
- Ensure class has `@Scanned` or is in scanned package

### 4. Permission errors
**Problem**: User can't access data
- Check user has permission to view WMPR project
- Verify JQL query is valid for user's permissions
- Add error handling for unauthorized access

---

## 📚 Key Technologies Summary

| Technology | Purpose | In Our Plugin |
|------------|---------|---------------|
| **Maven** | Build system | Multi-module build, dependency management |
| **Spring** | Dependency injection | Connects Java components, Jira integration |
| **JAX-RS** | REST endpoints | `/rest/wmpr-requests/1.0/recent` API |
| **Velocity** | Server-side templates | `wmpr-web-panel.vm` renders HTML |
| **React** | Frontend framework | Interactive table component |
| **TypeScript** | Type-safe JavaScript | Prevents runtime errors |
| **AtlasKit** | Jira UI components | Consistent styling and behavior |
| **Webpack** | JavaScript bundler | Packages React for Jira consumption |
| **Gson** | JSON serialization | Java objects ↔ JSON conversion |

---

## 🎓 Learning Path

### Beginner
1. **Understand the big picture**: How backend and frontend communicate
2. **Learn Maven basics**: Dependencies, modules, build lifecycle
3. **Java fundamentals**: Classes, objects, annotations
4. **REST concepts**: HTTP methods, endpoints, JSON

### Intermediate  
1. **Spring Framework**: Dependency injection, annotations
2. **JAX-RS**: REST endpoint creation
3. **React basics**: Components, state, hooks
4. **Jira APIs**: SearchService, JQL, permissions

### Advanced
1. **AtlasKit mastery**: Complex UI components
2. **Performance optimization**: Caching, pagination
3. **Error handling**: Robust error recovery
4. **Testing**: Unit tests, integration tests

---

## 🔗 Resources

- **Atlassian Developer Docs**: https://developer.atlassian.com/server/jira/
- **Spring Framework**: https://spring.io/guides
- **React Documentation**: https://reactjs.org/docs/
- **AtlasKit Components**: https://atlassian.design/components
- **JAX-RS Tutorial**: https://jersey.github.io/documentation/latest/
- **Maven Guide**: https://maven.apache.org/guides/

This plugin demonstrates real-world patterns used in enterprise Jira development. Each piece has a specific purpose, and understanding how they connect gives you the foundation to build any Jira plugin! 