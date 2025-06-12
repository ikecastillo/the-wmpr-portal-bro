# 🚀 Complete Guide: Building a Jira Plugin from Scratch
## From Zero to Production - WMPR Service Desk Requests Table Plugin

This comprehensive guide takes you from a blank Windows machine to a fully functional Jira plugin. You'll learn every step: environment setup, development, testing, and deployment.

---

## 📋 Table of Contents

1. [🔧 Windows Environment Setup](#-windows-environment-setup)
2. [🏗️ Project Overview](#️-project-overview)
3. [📁 Creating the Plugin Structure](#-creating-the-plugin-structure)
4. [☕ Building the Java Backend](#-building-the-java-backend)
5. [⚛️ Building the React Frontend](#️-building-the-react-frontend)
6. [🔌 Integration & Testing](#-integration--testing)
7. [🚀 Deployment & Distribution](#-deployment--distribution)
8. [🐛 Troubleshooting Guide](#-troubleshooting-guide)
9. [📚 Advanced Topics](#-advanced-topics)

---

## 🔧 Windows Environment Setup

### Prerequisites Checklist
Before we start, you'll need:
- Windows 10/11 (64-bit)
- Administrator access
- Stable internet connection
- ~5GB free disk space

### Step 1: Install Java Development Kit (JDK)

**1.1 Download JDK 11**
```
Visit: https://adoptopenjdk.net/
Download: OpenJDK 11 (LTS) - Windows x64 MSI
```

**1.2 Install JDK**
```
1. Run the downloaded MSI installer
2. Choose "Add to PATH" option
3. Install to default location: C:\Program Files\AdoptOpenJDK\jdk-11.0.x.x-hotspot\
4. Click "Install" and complete setup
```

**1.3 Verify Installation**
```cmd
# Open Command Prompt (cmd) and run:
java -version
javac -version

# Expected output:
# openjdk version "11.0.x"
# javac 11.0.x
```

### Step 2: Install Maven

**2.1 Download Maven**
```
Visit: https://maven.apache.org/download.cgi
Download: Binary zip archive (apache-maven-3.9.x-bin.zip)
```

**2.2 Extract and Install**
```
1. Extract to: C:\Program Files\Apache\maven\
2. Final path should be: C:\Program Files\Apache\maven\apache-maven-3.9.x\
```

**2.3 Set Environment Variables**
```
1. Press Win + R, type: sysdm.cpl
2. Click "Environment Variables"
3. Under "System Variables" click "New":
   - Variable name: MAVEN_HOME
   - Variable value: C:\Program Files\Apache\maven\apache-maven-3.9.x

4. Find "Path" in System Variables, click "Edit"
5. Click "New" and add: %MAVEN_HOME%\bin
6. Click OK to save all changes
7. Restart Command Prompt
```

**2.4 Verify Maven**
```cmd
mvn -version

# Expected output:
# Apache Maven 3.9.x
# Maven home: C:\Program Files\Apache\maven\apache-maven-3.9.x
# Java version: 11.0.x
```

### Step 3: Install Atlassian SDK

**3.1 Download Atlassian SDK**
```
Visit: https://developer.atlassian.com/server/framework/atlassian-sdk/downloads/
Download: Atlassian Plugin SDK for Windows
```

**3.2 Install SDK**
```
1. Run the downloaded installer
2. Install to default location: C:\atlassian\atlassian-plugin-sdk-x.x.x\
3. Installer automatically adds to PATH
```

**3.3 Set Environment Variables**
```
Add these to System Environment Variables:

Variable: ATLAS_HOME
Value: C:\atlassian\atlassian-plugin-sdk-x.x.x

Variable: ATLAS_MVN
Value: %ATLAS_HOME%\bin\atlas-mvn.bat

Update PATH to include: %ATLAS_HOME%\bin
```

**3.4 Verify SDK Installation**
```cmd
atlas-version

# Expected output:
# ATLAS Version:    x.x.x
# ATLAS Home:       C:\atlassian\atlassian-plugin-sdk-x.x.x
# ATLAS Scripts:    C:\atlassian\atlassian-plugin-sdk-x.x.x\bin
# AMPS Version:     x.x.x
# Maven Version:    3.x.x
# Java Version:     11.0.x
```

### Step 4: Install Node.js and npm

**4.1 Download Node.js**
```
Visit: https://nodejs.org/
Download: LTS version (Windows Installer)
```

**4.2 Install Node.js**
```
1. Run installer with default settings
2. Make sure "Add to PATH" is checked
3. Install npm package manager option is selected
```

**4.3 Verify Installation**
```cmd
node --version
npm --version

# Expected output:
# v18.x.x or higher
# 9.x.x or higher
```

### Step 5: Install Git (Optional but Recommended)

**5.1 Download Git**
```
Visit: https://git-scm.com/download/win
Download: Git for Windows
```

**5.2 Install Git**
```
1. Run installer
2. Use default settings
3. Select "Git from the command line and also from 3rd-party software"
4. Select "Use Windows' default console window"
```

**5.3 Verify Git**
```cmd
git --version

# Expected output:
# git version 2.x.x.windows.x
```

### Step 6: Configure Development Environment

**6.1 Create Development Directory**
```cmd
mkdir C:\dev\jira-plugins
cd C:\dev\jira-plugins
```

**6.2 Set JAVA_HOME (if not set automatically)**
```cmd
# Add to System Environment Variables:
Variable: JAVA_HOME
Value: C:\Program Files\AdoptOpenJDK\jdk-11.0.x.x-hotspot
```

**6.3 Verify Complete Setup**
```cmd
# Run all these commands to verify everything works:
java -version
javac -version
mvn -version
atlas-version
node --version
npm --version
```

---

## 🏗️ Project Overview

### What We're Building

**Goal**: A Jira plugin that displays the 10 most recent WMPR Service Desk requests in a table at the bottom of the Service Desk portal.

**Components**:
- **Backend**: Java REST API using JAX-RS
- **Frontend**: React table component with AtlasKit
- **Integration**: Jira Web Panel in Service Desk footer

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Jira User     │    │  Service Desk   │    │  WMPR Project   │
│  (Browser)      │───▶│     Portal      │───▶│    Issues       │
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
                               │ HTTP Request
                               ▼
                    ┌─────────────────┐
                    │  REST Endpoint  │ ◀── Our Java backend
                    │   (/rest/...)   │
                    └─────────────────┘
                               │ JQL Query
                               ▼
                    ┌─────────────────┐
                    │   Jira Search   │ ◀── Finds WMPR issues
                    │     Service     │
                    └─────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Build System** | Maven | Multi-module project management |
| **Backend Framework** | Spring + JAX-RS | REST API and dependency injection |
| **Frontend Framework** | React + TypeScript | Interactive UI components |
| **UI Components** | AtlasKit | Jira-native styling |
| **Bundler** | Webpack | Frontend build and packaging |
| **Template Engine** | Velocity | Server-side HTML generation |
| **Data Format** | JSON | API communication |
| **Query Language** | JQL | Jira issue searching |

---

## 📁 Creating the Plugin Structure

### Step 1: Create Parent Project

**1.1 Generate Plugin Skeleton**
```cmd
cd C:\dev\jira-plugins
atlas-create-jira-plugin

# When prompted, enter:
# groupId: com.example.wmpr
# artifactId: wmpr-requests-plugin
# version: 1.0.0
# package: com.example.wmpr
```

**1.2 Navigate to Project**
```cmd
cd wmpr-requests-plugin
```

**1.3 Project Structure Created**
```
wmpr-requests-plugin/
├── pom.xml                          # Maven configuration
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/wmpr/
│   │   │       └── MyPluginComponent.java
│   │   └── resources/
│   │       ├── atlassian-plugin.xml  # Plugin configuration
│   │       └── templates/
├── src/test/                        # Test files
└── target/                          # Build output
```

### Step 2: Convert to Multi-Module Project

**2.1 Backup Generated Files**
```cmd
mkdir temp-backup
copy src\main\* temp-backup\ /s
```

**2.2 Create New Parent POM**
```cmd
# Replace the generated pom.xml
```

**2.3 Create Module Directories**
```cmd
mkdir frontend
mkdir backend
```

**2.4 Move Backend Files**
```cmd
mkdir backend\src
move temp-backup\* backend\src\ /s
move src backend\
```

**2.5 Final Structure**
```
wmpr-requests-plugin/               # Root project
├── pom.xml                        # Parent POM
├── frontend/                      # React module
│   └── pom.xml                   # Frontend build config
├── backend/                       # Java module
│   ├── pom.xml                   # Backend dependencies
│   └── src/                      # Moved from root
└── temp-backup/                   # Can delete later
```

---

## ☕ Building the Java Backend

### Step 1: Configure Parent POM

Create the root `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/maven-v4_0_0.xsd">

    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example.wmpr</groupId>
    <artifactId>wmpr-requests-plugin</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>
    
    <name>WMPR Service Desk Requests Plugin</name>
    <description>Displays recent WMPR Service Desk requests in a table</description>
    
    <modules>
        <module>frontend</module>
        <module>backend</module>
    </modules>
    
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <jira.version>8.20.0</jira.version>
        <amps.version>8.1.2</amps.version>
    </properties>
    
</project>
```

### Step 2: Configure Backend Module

Create `backend/pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/maven-v4_0_0.xsd">

    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>com.example.wmpr</groupId>
        <artifactId>wmpr-requests-plugin</artifactId>
        <version>1.0.0</version>
    </parent>
    
    <artifactId>backend</artifactId>
    <packaging>atlassian-plugin</packaging>
    
    <name>WMPR Requests Backend</name>
    
    <dependencies>
        <!-- Jira API -->
        <dependency>
            <groupId>com.atlassian.jira</groupId>
            <artifactId>jira-api</artifactId>
            <version>${jira.version}</version>
            <scope>provided</scope>
        </dependency>
        
        <!-- Spring Framework -->
        <dependency>
            <groupId>com.atlassian.plugin</groupId>
            <artifactId>atlassian-spring-scanner-annotation</artifactId>
            <version>2.2.4</version>
            <scope>provided</scope>
        </dependency>
        
        <!-- REST API -->
        <dependency>
            <groupId>javax.ws.rs</groupId>
            <artifactId>jsr311-api</artifactId>
            <version>1.1.1</version>
            <scope>provided</scope>
        </dependency>
        
        <!-- JSON Processing -->
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.8.9</version>
        </dependency>
        
        <!-- Servlet API -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>3.1.0</version>
            <scope>provided</scope>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <!-- Atlassian Maven Plugin -->
            <plugin>
                <groupId>com.atlassian.maven.plugins</groupId>
                <artifactId>jira-maven-plugin</artifactId>
                <version>${amps.version}</version>
                <extensions>true</extensions>
                <configuration>
                    <productVersion>${jira.version}</productVersion>
                    <productDataVersion>${jira.version}</productDataVersion>
                    <enableQuickReload>true</enableQuickReload>
                    <jvmArgs>-Xms1024m -Xmx2048m</jvmArgs>
                    <instructions>
                        <Atlassian-Plugin-Key>${atlassian.plugin.key}</Atlassian-Plugin-Key>
                        <Export-Package />
                        <Import-Package>
                            *;resolution:=optional
                        </Import-Package>
                        <Spring-Context>*</Spring-Context>
                    </instructions>
                </configuration>
            </plugin>
            
            <!-- Spring Scanner -->
            <plugin>
                <groupId>com.atlassian.plugin</groupId>
                <artifactId>atlassian-spring-scanner-maven-plugin</artifactId>
                <version>2.2.4</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>atlassian-spring-scanner</goal>
                        </goals>
                        <phase>process-classes</phase>
                    </execution>
                </executions>
                <configuration>
                    <includeExclude>+com.example.wmpr.**</includeExclude>
                    <scannedDependencies>
                        <dependency>
                            <groupId>com.atlassian.plugin</groupId>
                            <artifactId>atlassian-spring-scanner-external-jar</artifactId>
                        </dependency>
                    </scannedDependencies>
                    <verbose>false</verbose>
                </configuration>
            </plugin>
        </plugins>
    </build>
    
    <properties>
        <atlassian.plugin.key>com.example.wmpr.backend</atlassian.plugin.key>
    </properties>
    
</project>
```

### Step 3: Configure Plugin Descriptor

Update `backend/src/main/resources/atlassian-plugin.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<atlassian-plugin key="${atlassian.plugin.key}" name="${project.name}" plugins-version="2">
    
    <plugin-info>
        <description>${project.description}</description>
        <version>${project.version}</version>
        <vendor name="Example Corp" url="https://example.com"/>
        <param name="plugin-icon">images/pluginIcon.png</param>
        <param name="plugin-logo">images/pluginLogo.png</param>
    </plugin-info>
    
    <!-- Spring Scanner -->
    <component-import key="applicationProperties" interface="com.atlassian.sal.api.ApplicationProperties"/>
    
    <!-- Web Panel: Displays our component in Service Desk footer -->
    <web-panel location="servicedesk.portal.footer" key="wmpr-requests-panel" 
               class="com.example.wmpr.webpanel.WMPRRequestsWebPanel">
        <description>Displays recent WMPR Service Desk requests</description>
        <label key="wmpr.requests.panel.label"/>
        <resource name="view" type="velocity" location="/templates/wmpr-web-panel.vm"/>
        <condition class="com.example.wmpr.conditions.ServiceDeskCondition"/>
    </web-panel>
    
    <!-- REST Module: Provides API endpoints -->
    <rest name="WMPR Requests REST" path="/wmpr-requests" version="1.0">
        <description>REST endpoints for WMPR Service Desk requests</description>
        <package>com.example.wmpr.rest</package>
    </rest>
    
    <!-- Web Resources: Frontend JavaScript and CSS -->
    <web-resource-transformer key="soyTransformer" 
                             class="com.atlassian.plugin.webresource.transformer.WebResourceTransformerModuleDescriptor">
        <transformer key="soyTransformer" class="com.atlassian.soy.renderer.SoyTemplateRenderer"/>
    </web-resource-transformer>
    
    <!-- i18n Resources -->
    <resource type="i18n" name="i18n" location="i18n.wmpr-requests"/>
    
</atlassian-plugin>
```

---

## 🔌 Integration & Testing

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

## 🚀 Deployment & Distribution

### 1. Full Plugin Build
```bash
# From project root
atlas-mvn package
# Creates: backend/target/backend-1.0.0.jar
```

### 2. Testing Cycle
```bash
# Start Jira with plugin
atlas-mvn jira:run
# Jira starts at http://localhost:2990/jira
# Login: admin/admin
# Test your changes
```

---

## 🐛 Troubleshooting Guide

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

## 📚 Advanced Topics

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

### Step 9: Create i18n Properties

Create `backend/src/main/resources/i18n.wmpr-requests.properties`:

```properties
# WMPR Service Desk Requests Plugin - Internationalization

# Panel Labels
wmpr.requests.panel.label=Recent WMPR Service Desk Requests
wmpr.requests.panel.description=Displays the most recent Service Desk requests from the WMPR project

# Table Headers
wmpr.requests.table.key=Key
wmpr.requests.table.summary=Summary
wmpr.requests.table.reporter=Reporter
wmpr.requests.table.status=Status
wmpr.requests.table.created=Created
wmpr.requests.table.priority=Priority

# Messages
wmpr.requests.loading=Loading WMPR requests...
wmpr.requests.error.generic=Failed to load WMPR requests
wmpr.requests.error.permission=You don't have permission to view WMPR requests
wmpr.requests.error.network=Network error while fetching requests
wmpr.requests.empty=No WMPR requests found
wmpr.requests.refresh=Refresh

# Status Messages
wmpr.requests.status.new=New
wmpr.requests.status.inprogress=In Progress
wmpr.requests.status.done=Done
```

### Step 10: Test Backend Build

```cmd
cd C:\dev\jira-plugins\wmpr-requests-plugin\backend
atlas-mvn compile

# Expected output:
# [INFO] BUILD SUCCESS
# [INFO] Total time: X seconds
```

**Fix Common Issues:**

If you get compilation errors:
```cmd
# Clean and rebuild
atlas-mvn clean compile

# Check for missing dependencies
atlas-mvn dependency:tree
```

---

## ⚛️ Building the React Frontend

### Step 1: Configure Frontend Module

Create `frontend/pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/maven-v4_0_0.xsd">

    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>com.example.wmpr</groupId>
        <artifactId>wmpr-requests-plugin</artifactId>
        <version>1.0.0</version>
    </parent>
    
    <artifactId>frontend</artifactId>
    <packaging>pom</packaging>
    
    <name>WMPR Requests Frontend</name>
    
    <build>
        <plugins>
            <!-- Frontend Maven Plugin -->
            <plugin>
                <groupId>com.github.eirslett</groupId>
                <artifactId>frontend-maven-plugin</artifactId>
                <version>1.12.1</version>
                <configuration>
                    <workingDirectory>.</workingDirectory>
                    <nodeVersion>v18.17.0</nodeVersion>
                    <npmVersion>9.6.7</npmVersion>
                </configuration>
                <executions>
                    <!-- Install Node.js and npm -->
                    <execution>
                        <id>install node and npm</id>
                        <goals>
                            <goal>install-node-and-npm</goal>
                        </goals>
                        <phase>generate-resources</phase>
                    </execution>
                    
                    <!-- Install npm dependencies -->
                    <execution>
                        <id>npm install</id>
                        <goals>
                            <goal>npm</goal>
                        </goals>
                        <phase>generate-resources</phase>
                        <configuration>
                            <arguments>install</arguments>
                        </configuration>
                    </execution>
                    
                    <!-- Build frontend -->
                    <execution>
                        <id>npm run build</id>
                        <goals>
                            <goal>npm</goal>
                        </goals>
                        <phase>compile</phase>
                        <configuration>
                            <arguments>run build</arguments>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
    
</project>
```

### Step 2: Create Package.json

Create `frontend/package.json`:

```json
{
  "name": "wmpr-requests-frontend",
  "version": "1.0.0",
  "description": "React frontend for WMPR Service Desk requests",
  "main": "src/wmpr-requests-table.tsx",
  "scripts": {
    "build": "webpack --mode=production",
    "dev": "webpack --mode=development --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "@atlaskit/dynamic-table": "^14.8.7",
    "@atlaskit/spinner": "^15.2.6",
    "@atlaskit/lozenge": "^11.3.1",
    "@atlaskit/button": "^16.5.4",
    "@atlaskit/icon": "^21.11.4",
    "@atlaskit/theme": "^12.2.4",
    "@atlaskit/tokens": "^1.29.0"
  },
  "devDependencies": {
    "@types/react": "^17.0.52",
    "@types/react-dom": "^17.0.18",
    "typescript": "^4.9.4",
    "webpack": "^5.75.0",
    "webpack-cli": "^5.0.1",
    "ts-loader": "^9.4.2",
    "atlassian-webresource-webpack-plugin": "^4.0.1",
    "@typescript-eslint/eslint-plugin": "^5.48.0",
    "@typescript-eslint/parser": "^5.48.0",
    "eslint": "^8.31.0",
    "eslint-plugin-react": "^7.32.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### Step 3: Create Webpack Configuration

Create `frontend/webpack.config.js`:

```javascript
const WrmPlugin = require('atlassian-webresource-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'production',
    
    entry: {
        'wmprRequestsTable': './src/wmpr-requests-table.tsx'
    },
    
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        alias: {
            'react': path.resolve('./node_modules/react'),
            'react-dom': path.resolve('./node_modules/react-dom')
        }
    },
    
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    },
    
    plugins: [
        new WrmPlugin({
            pluginKey: 'com.example.wmpr.backend',
            xmlDescriptors: path.resolve('../backend/src/main/resources/META-INF/maven/'),
            contextMap: {
                'wmprRequestsTable': ['servicedesk.portal.footer', 'atl.general']
            },
            providedDependencies: {
                'com.atlassian.auiplugin:ajs': {
                    dependency: 'com.atlassian.auiplugin:ajs',
                    import: {
                        var: 'AJS',
                        amd: 'ajs'
                    }
                }
            }
        })
    ],
    
    output: {
        filename: 'bundled.[name].js',
        path: path.resolve('../backend/src/main/resources/frontend'),
        library: {
            type: 'window',
            name: '[name]'
        }
    },
    
    optimization: {
        minimize: true,
        splitChunks: false
    },
    
    performance: {
        maxAssetSize: 1000000,
        maxEntrypointSize: 1000000
    }
};
```

### Step 4: Create TypeScript Configuration

Create `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "jsx": "react-jsx",
    "declaration": false,
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "../backend"
  ]
}
```

### Step 5: Create React Component

Create `frontend/src/wmpr-requests-table.tsx`:

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import DynamicTable from '@atlaskit/dynamic-table';
import Spinner from '@atlaskit/spinner';
import Lozenge from '@atlaskit/lozenge';
import Button from '@atlaskit/button';
import { token } from '@atlaskit/tokens';

// TypeScript interfaces
interface ServiceDeskRequest {
    key: string;
    summary: string;
    reporter: string;
    reporterDisplayName: string;
    assignee?: string;
    assigneeDisplayName?: string;
    status: string;
    statusCategory: string;
    priority: string;
    created: string;
    updated: string;
    issueType: string;
    projectKey: string;
}

interface WMPRTableConfig {
    restPath: string;
    autoRefresh: boolean;
    refreshInterval: number;
    maxResults: number;
    currentUser: string;
}

interface TableRow {
    key: string;
    cells: any[];
}

// Status category to color mapping
const getStatusColor = (statusCategory: string): 'new' | 'inprogress' | 'moved' | 'success' | 'removed' => {
    switch (statusCategory?.toLowerCase()) {
        case 'new': return 'new';
        case 'indeterminate': return 'inprogress';
        case 'done': return 'success';
        default: return 'moved';
    }
};

// Priority to color mapping
const getPriorityColor = (priority: string): 'new' | 'inprogress' | 'moved' | 'success' | 'removed' => {
    switch (priority?.toLowerCase()) {
        case 'highest':
        case 'high': return 'removed';
        case 'medium': return 'moved';
        case 'low':
        case 'lowest': return 'new';
        default: return 'moved';
    }
};

// Format date for display
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
};

// Truncate text with ellipsis
const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Main React Component
const WMPRRequestsTable: React.FC<{ config: WMPRTableConfig }> = ({ config }) => {
    const [requests, setRequests] = useState<ServiceDeskRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Fetch requests from REST API
    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const url = `${config.restPath}?limit=${config.maxResults}`;
            console.log('Fetching WMPR requests from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: ServiceDeskRequest[] = await response.json();
            console.log('Received WMPR requests:', data);

            setRequests(data);
            setLastUpdated(new Date());
            setError(null);

        } catch (err) {
            console.error('Error fetching WMPR requests:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load requests';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [config.restPath, config.maxResults]);

    // Initial load and auto-refresh setup
    useEffect(() => {
        fetchRequests();

        if (config.autoRefresh && config.refreshInterval > 0) {
            const interval = setInterval(fetchRequests, config.refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchRequests, config.autoRefresh, config.refreshInterval]);

    // Expose refresh function globally
    useEffect(() => {
        (window as any).refreshWMPRRequestsTable = fetchRequests;
        return () => {
            delete (window as any).refreshWMPRRequestsTable;
        };
    }, [fetchRequests]);

    // Table column definitions
    const head = {
        cells: [
            {
                key: 'key',
                content: 'Key',
                isSortable: true,
                width: 10
            },
            {
                key: 'summary',
                content: 'Summary',
                isSortable: true,
                width: 40
            },
            {
                key: 'reporter',
                content: 'Reporter',
                isSortable: true,
                width: 15
            },
            {
                key: 'status',
                content: 'Status',
                isSortable: true,
                width: 12
            },
            {
                key: 'priority',
                content: 'Priority',
                isSortable: true,
                width: 10
            },
            {
                key: 'created',
                content: 'Created',
                isSortable: true,
                width: 13
            }
        ]
    };

    // Convert requests to table rows
    const rows: TableRow[] = requests.map((request) => ({
        key: request.key,
        cells: [
            {
                key: 'key',
                content: (
                    <a 
                        href={`/browse/${request.key}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontWeight: 'bold' }}
                    >
                        {request.key}
                    </a>
                )
            },
            {
                key: 'summary',
                content: (
                    <span title={request.summary}>
                        {truncateText(request.summary, 60)}
                    </span>
                )
            },
            {
                key: 'reporter',
                content: (
                    <span title={request.reporterDisplayName || request.reporter}>
                        {truncateText(request.reporterDisplayName || request.reporter, 20)}
                    </span>
                )
            },
            {
                key: 'status',
                content: (
                    <Lozenge appearance={getStatusColor(request.statusCategory)}>
                        {request.status}
                    </Lozenge>
                )
            },
            {
                key: 'priority',
                content: (
                    <Lozenge appearance={getPriorityColor(request.priority)}>
                        {request.priority}
                    </Lozenge>
                )
            },
            {
                key: 'created',
                content: (
                    <span title={request.created}>
                        {formatDate(request.created)}
                    </span>
                )
            }
        ]
    }));

    // Loading state
    if (loading && requests.length === 0) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px',
                flexDirection: 'column',
                gap: token('space.200', '16px')
            }}>
                <Spinner size="large" />
                <p>Loading WMPR requests...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{ 
                padding: token('space.300', '24px'),
                textAlign: 'center',
                color: token('color.text.danger', '#c9372c')
            }}>
                <h4>Error Loading Requests</h4>
                <p>{error}</p>
                <Button appearance="primary" onClick={fetchRequests}>
                    Retry
                </Button>
            </div>
        );
    }

    // Empty state
    if (requests.length === 0) {
        return (
            <div style={{ 
                padding: token('space.300', '24px'),
                textAlign: 'center',
                color: token('color.text.subtlest', '#6b778c')
            }}>
                <h4>No WMPR Requests Found</h4>
                <p>There are no recent Service Desk requests in the WMPR project.</p>
                <Button appearance="subtle" onClick={fetchRequests}>
                    Refresh
                </Button>
            </div>
        );
    }

    // Main table display
    return (
        <div style={{ width: '100%' }}>
            {/* Status Bar */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: token('space.200', '16px'),
                fontSize: '0.9em',
                color: token('color.text.subtle', '#6b778c')
            }}>
                <span>
                    Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
                </span>
                {lastUpdated && (
                    <span>
                        Last updated: {lastUpdated.toLocaleTimeString()}
                        {loading && <Spinner size="small" style={{ marginLeft: '8px' }} />}
                    </span>
                )}
            </div>

            {/* Data Table */}
            <DynamicTable
                head={head}
                rows={rows}
                rowsPerPage={config.maxResults}
                defaultSortKey="created"
                defaultSortOrder="DESC"
                isFixedSize
                isRankable={false}
                emptyView={
                    <div style={{ textAlign: 'center', padding: token('space.300', '24px') }}>
                        No requests to display
                    </div>
                }
            />

            {/* Footer Info */}
            <div style={{ 
                marginTop: token('space.200', '16px'),
                fontSize: '0.8em',
                color: token('color.text.subtlest', '#6b778c'),
                fontStyle: 'italic'
            }}>
                {config.autoRefresh ? (
                    <>Auto-refreshes every {config.refreshInterval / 1000} seconds</>
                ) : (
                    <>Manual refresh only</>
                )}
                {' • '}
                Powered by WMPR Service Desk Plugin
            </div>
        </div>
    );
};

// Initialization function
const initWMPRRequestsTable = (containerId: string, config: WMPRTableConfig) => {
    console.log('Initializing WMPR Requests Table in container:', containerId);
    console.log('Configuration:', config);

    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container element not found:', containerId);
        return;
    }

    try {
        ReactDOM.render(
            <WMPRRequestsTable config={config} />,
            container
        );
        console.log('WMPR Requests Table successfully initialized');
    } catch (error) {
        console.error('Error initializing WMPR Requests Table:', error);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #c9372c;">
                <h4>Error Loading Table</h4>
                <p>Failed to initialize WMPR requests table: ${error}</p>
            </div>
        `;
    }
};

// Export for global access
(window as any).initWMPRRequestsTable = initWMPRRequestsTable;

export default WMPRRequestsTable;
export { initWMPRRequestsTable };
```

### Step 6: Build Frontend

```cmd
cd C:\dev\jira-plugins\wmpr-requests-plugin\frontend
npm install
npm run build

# Expected output:
# Frontend build completed successfully
# Files generated in ../backend/src/main/resources/frontend/
```

---

## 🔌 Integration & Testing

### Step 1: Complete Build

```cmd
# From project root
cd C:\dev\jira-plugins\wmpr-requests-plugin
atlas-mvn clean package

# Expected output:
# [INFO] wmpr-requests-plugin ............................ SUCCESS
# [INFO] frontend ....................................... SUCCESS  
# [INFO] backend ........................................ SUCCESS
# [INFO] Total time: XX seconds
```

### Step 2: Start Development Environment

```cmd
# Start Jira with your plugin
atlas-mvn jira:run

# Wait for:
# [INFO] jira started successfully in XXXs at http://localhost:2990/jira
# [INFO] Type Ctrl-D to shutdown gracefully
# [INFO] Type Ctrl-C to exit
```

**Initial Setup:**
1. Open browser: `http://localhost:2990/jira`
2. Login: `admin` / `admin`
3. Complete setup wizard (select defaults)
4. Create WMPR project if needed

### Step 3: Test REST Endpoint

**3.1 Test Health Check**
```
Open: http://localhost:2990/jira/rest/wmpr-requests/1.0/recent/health

Expected Response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "user": "admin"
}
```

**3.2 Test Data Endpoint**
```
Open: http://localhost:2990/jira/rest/wmpr-requests/1.0/recent

Expected Response:
[
  {
    "key": "WMPR-1",
    "summary": "Sample request",
    "reporter": "admin",
    ...
  }
]
```

### Step 4: Test Web Panel

**4.1 Navigate to Service Desk**
- Go to a Service Desk portal page
- Look for WMPR requests panel in footer
- Verify table loads with data

**4.2 Test React Component**
- Check browser console for errors
- Verify auto-refresh works
- Test manual refresh button

### Step 5: Debug Common Issues

**5.1 Plugin Not Loading**
```cmd
# Check plugin status
curl http://localhost:2990/jira/rest/plugins/1.0/com.example.wmpr.backend

# Restart if needed
atlas-mvn jira:stop
atlas-mvn jira:run
```

**5.2 REST Endpoint 404**
```cmd
# Verify REST module registration
grep -r "wmpr-requests" backend/src/main/resources/

# Check logs
tail -f target/jira/home/log/atlassian-jira.log
```

**5.3 Frontend Not Loading**
```cmd
# Check web resources
ls -la backend/src/main/resources/frontend/

# Rebuild frontend
cd frontend
npm run build
cd ..
atlas-mvn compile
```

---

## 🚀 Deployment & Distribution

### Step 1: Production Build

```cmd
# Create production JAR
atlas-mvn clean package -Dmaven.test.skip=true

# Output location:
# backend/target/backend-1.0.0.jar
```

### Step 2: Install on Target Jira

**Via Jira Admin UI:**
1. Go to Jira Administration
2. Click "Manage apps"
3. Click "Upload app"
4. Select `backend-1.0.0.jar`
5. Click "Upload"

**Via Command Line:**
```bash
# Copy JAR to Jira plugins directory
cp backend/target/backend-1.0.0.jar /opt/atlassian/jira/plugins/

# Restart Jira
sudo service jira restart
```

### Step 3: Production Configuration

**3.1 Environment Variables**
```bash
# Set production settings
export JIRA_MAX_MEMORY=4096m
export JIRA_MIN_MEMORY=2048m
export CATALINA_OPTS="-server -Xms2048m -Xmx4096m"
```

**3.2 Security Considerations**
- Enable HTTPS in production
- Configure proper user permissions
- Restrict API access as needed
- Monitor plugin performance

### Step 4: Monitoring & Maintenance

**4.1 Log Monitoring**
```bash
# Monitor plugin logs
tail -f /opt/atlassian/jira/logs/atlassian-jira.log | grep WMPR

# Check for errors
grep "ERROR.*wmpr" /opt/atlassian/jira/logs/atlassian-jira.log
```

**4.2 Performance Monitoring**
- Monitor REST endpoint response times
- Check memory usage
- Monitor user feedback

---

## 🐛 Advanced Troubleshooting Guide

### Environment Issues

**Java Version Conflicts**
```cmd
# Check Java version
java -version
javac -version

# Set JAVA_HOME explicitly
set JAVA_HOME=C:\Program Files\AdoptOpenJDK\jdk-11.0.x.x-hotspot
```

**Maven Repository Issues**
```cmd
# Clear local repository
atlas-mvn dependency:purge-local-repository

# Force download dependencies
atlas-mvn clean compile -U
```

**Node.js Version Issues**
```cmd
# Check Node version
node --version

# Use Node Version Manager if needed
nvm install 18.17.0
nvm use 18.17.0
```

### Build Issues

**Frontend Build Failures**
```cmd
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rd /s node_modules
npm install

# Check for webpack errors
npm run build -- --verbose
```

**Backend Compilation Errors**
```cmd
# Check for missing imports
grep -r "import.*cannot be resolved" backend/src/

# Verify plugin dependencies
atlas-mvn dependency:tree | grep jira
```

**Spring Scanner Issues**
```cmd
# Check for component scanning
grep -r "@Scanned" backend/src/

# Verify package structure
find backend/src -name "*.java" | grep -E "(rest|webpanel|conditions)"
```

### Runtime Issues

**Web Panel Not Appearing**
1. Check condition class logic
2. Verify location in atlassian-plugin.xml
3. Test in different Jira contexts
4. Check user permissions

**REST API Errors**
```cmd
# Check endpoint registration
curl http://localhost:2990/jira/rest/plugins/1.0/

# Test with authentication
curl -u admin:admin http://localhost:2990/jira/rest/wmpr-requests/1.0/recent

# Check JQL query syntax
# Use Jira's issue navigator to test JQL
```

**React Component Issues**
1. Open browser dev tools
2. Check console for JavaScript errors
3. Verify network requests succeed
4. Check React component props

### Performance Issues

**Slow REST Responses**
- Add pagination to JQL queries
- Implement caching mechanisms
- Optimize database queries
- Monitor Jira system performance

**Memory Leaks**
- Check for JavaScript memory leaks
- Monitor Java heap usage
- Implement proper cleanup in useEffect

**High CPU Usage**
- Reduce auto-refresh frequency
- Optimize React rendering
- Profile plugin performance

### Security Issues

**Permission Errors**
```java
// Add permission checks in REST endpoint
if (!permissionManager.hasPermission(Permissions.BROWSE, project, user)) {
    return Response.status(Response.Status.FORBIDDEN).build();
}
```

**XSS Prevention**
- Validate all user inputs
- Sanitize data before display
- Use AtlasKit components (built-in XSS protection)

### Production Issues

**Plugin Crashes**
```bash
# Check Jira logs
grep "ERROR.*com.example.wmpr" /opt/atlassian/jira/logs/atlassian-jira.log

# Monitor system resources
top -p $(pgrep java)
```

**Database Issues**
```bash
# Check database connections
grep "database" /opt/atlassian/jira/logs/atlassian-jira.log

# Monitor query performance
# Use Jira's built-in SQL monitoring
```

---

## 📚 Advanced Topics & Extensions

### Adding Authentication

```java
// Custom authentication for API endpoints
@Component
public class WMPRAuthenticationManager {
    
    @JiraImport
    private final UserManager userManager;
    
    public boolean authenticateApiRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        // Implement custom auth logic
        return true;
    }
}
```

### Caching Implementation

```java
// Add caching to improve performance
@Component
public class WMPRCacheManager {
    
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final long CACHE_TTL = 300000; // 5 minutes
    
    public List<ServiceDeskRequest> getCachedRequests(String cacheKey) {
        CacheEntry entry = cache.get(cacheKey);
        if (entry != null && !entry.isExpired()) {
            return entry.getData();
        }
        return null;
    }
}
```

### Advanced Frontend Features

```typescript
// Add filtering and search capabilities
const [filters, setFilters] = useState({
    status: '',
    priority: '',
    reporter: ''
});

// Implement real-time updates with WebSockets
useEffect(() => {
    const ws = new WebSocket('ws://localhost:2990/jira/websocket/wmpr');
    ws.onmessage = (event) => {
        const update = JSON.parse(event.data);
        // Handle real-time updates
    };
    
    return () => ws.close();
}, []);
```

### Testing Framework

```java
// Unit tests for REST endpoints
@ExtendWith(MockitoExtension.class)
class WMPRRequestsRestResourceTest {
    
    @Mock
    private SearchService searchService;
    
    @InjectMocks
    private WMPRRequestsRestResource resource;
    
    @Test
    void testGetRecentRequests() {
        // Test implementation
    }
}
```

### Internationalization

```properties
# Multiple language support
# en_US.properties
wmpr.requests.panel.title=Recent WMPR Service Desk Requests

# es_ES.properties
wmpr.requests.panel.title=Solicitudes Recientes de Mesa de Servicio WMPR

# fr_FR.properties
wmpr.requests.panel.title=Demandes Récentes du Service d'Assistance WMPR
```

### Configuration Management

```java
// Plugin configuration interface
@Component
public class WMPRConfigurationManager {
    
    @JiraImport
    private final PluginSettingsFactory pluginSettingsFactory;
    
    public int getMaxResults() {
        PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
        return Integer.parseInt(settings.get("wmpr.max.results", "10"));
    }
}
```

---

## 🎯 Next Steps & Best Practices

### Code Organization
- Separate concerns (data, business logic, presentation)
- Use dependency injection consistently
- Implement proper error handling
- Add comprehensive logging

### Performance Optimization
- Implement caching strategies
- Optimize database queries
- Use pagination for large datasets
- Minimize frontend bundle size

### Security Best Practices
- Validate all inputs
- Implement proper authentication
- Use parameterized queries
- Sanitize output data

### Maintenance & Monitoring
- Set up automated testing
- Monitor performance metrics
- Plan for upgrades
- Document configuration changes

This comprehensive guide takes you from zero to a production-ready Jira plugin. Each section builds on the previous ones, giving you both the practical steps and the theoretical understanding needed to build professional Jira plugins! 