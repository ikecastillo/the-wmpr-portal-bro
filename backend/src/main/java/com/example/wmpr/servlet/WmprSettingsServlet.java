package com.example.wmpr.servlet;

import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.project.Project;
import com.atlassian.jira.project.ProjectManager;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.atlassian.templaterenderer.TemplateRenderer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class WmprSettingsServlet extends HttpServlet {
    
    private static final String DEFAULT_JQL = "project = WMPR ORDER BY created DESC";
    private static final String SETTINGS_KEY_PREFIX = "wmpr.settings.";
    
    private TemplateRenderer getTemplateRenderer() {
        try {
            // Try multiple ways to get TemplateRenderer
            TemplateRenderer renderer = ComponentAccessor.getOSGiComponentInstanceOfType(TemplateRenderer.class);
            if (renderer != null) {
                return renderer;
            }
            
            // Alternative approach using component manager
            return ComponentAccessor.getComponentOfType(TemplateRenderer.class);
        } catch (Exception e) {
            System.err.println("Failed to get TemplateRenderer: " + e.getMessage());
            return null;
        }
    }
    
    private PluginSettingsFactory getPluginSettingsFactory() {
        return ComponentAccessor.getOSGiComponentInstanceOfType(PluginSettingsFactory.class);
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String projectKey = request.getParameter("projectKey");
        
        if (projectKey == null || projectKey.trim().isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Project key is required");
            return;
        }
        
        // Verify user has access to this project
        JiraAuthenticationContext authContext = ComponentAccessor.getJiraAuthenticationContext();
        ApplicationUser user = authContext.getLoggedInUser();
        
        if (user == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not authenticated");
            return;
        }
        
        ProjectManager projectManager = ComponentAccessor.getProjectManager();
        Project project = projectManager.getProjectByCurrentKey(projectKey);
        
        if (project == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Project not found");
            return;
        }
        
        try {
            // Get current settings - handle both Boolean and String values for compatibility
            PluginSettingsFactory pluginSettingsFactory = getPluginSettingsFactory();
            PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String currentJql = (String) settings.get(SETTINGS_KEY_PREFIX + projectKey + ".jql");
            
            // Handle both Boolean and String values for useCustom setting
            Object useCustomJqlObj = settings.get(SETTINGS_KEY_PREFIX + projectKey + ".useCustom");
            boolean useCustomJql = false;
            if (useCustomJqlObj instanceof Boolean) {
                useCustomJql = (Boolean) useCustomJqlObj;
            } else if (useCustomJqlObj instanceof String) {
                useCustomJql = "true".equals(useCustomJqlObj);
            }
            
            if (currentJql == null) {
                currentJql = DEFAULT_JQL;
            }
            
            // Check for success message
            boolean showSuccess = "true".equals(request.getParameter("saved"));
            
            // Try Velocity template first, fallback to HTML if needed
            try {
                renderVelocityTemplate(response, projectKey, project.getName(), currentJql, useCustomJql, showSuccess);
            } catch (Exception velocityError) {
                System.err.println("Velocity template failed, using HTML fallback: " + velocityError.getMessage());
                renderProjectSettingsHtml(response, projectKey, project.getName(), currentJql, useCustomJql, showSuccess);
            }
            
        } catch (Exception e) {
            System.err.println("Error in WMPR settings servlet: " + e.getMessage());
            e.printStackTrace();
            // Fallback to simple HTML if everything fails
            try {
                renderProjectSettingsHtml(response, projectKey, project != null ? project.getName() : "Unknown", 
                    DEFAULT_JQL, false, false);
            } catch (IOException ioError) {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to render settings page");
            }
        }
    }
    
    private void renderVelocityTemplate(HttpServletResponse response, String projectKey, String projectName, 
                                       String currentJql, boolean useCustomJql, boolean showSuccess) throws Exception {
        TemplateRenderer templateRenderer = getTemplateRenderer();
        if (templateRenderer == null) {
            throw new Exception("TemplateRenderer not available");
        }
        
        Map<String, Object> context = new HashMap<>();
        context.put("projectKey", projectKey);
        context.put("projectName", projectName);
        context.put("currentJql", currentJql);
        context.put("useCustomJql", useCustomJql);
        context.put("defaultJql", DEFAULT_JQL);
        context.put("showSuccess", showSuccess);
        
        response.setContentType("text/html;charset=UTF-8");
        templateRenderer.render("/templates/wmpr-settings.vm", context, response.getWriter());
    }
    
    private void renderProjectSettingsHtml(HttpServletResponse response, String projectKey, String projectName, 
                                          String currentJql, boolean useCustomJql, boolean showSuccess) throws IOException {
        response.setContentType("text/html;charset=UTF-8");
        response.getWriter().write(generateProjectSettingsHtml(projectKey, projectName, currentJql, useCustomJql, showSuccess));
    }
    
    private String generateProjectSettingsHtml(String projectKey, String projectName, String currentJql, 
                                              boolean useCustomJql, boolean showSuccess) {
        return "<!DOCTYPE html>\n" +
            "<html>\n" +
            "<head>\n" +
            "    <title>WMPR Settings - " + projectName + "</title>\n" +
            "    <meta name=\"decorator\" content=\"atl.admin\">\n" +
            "    <meta name=\"projectKey\" content=\"" + projectKey + "\">\n" +
            "    <meta name=\"projectName\" content=\"" + projectName + "\">\n" +
            "    <meta name=\"admin.active.section\" content=\"atl.jira.proj.config\">\n" +
            "    <meta name=\"admin.active.tab\" content=\"wmpr-settings\">\n" +
            "    <style>\n" +
            "        .wmpr-settings-container {\n" +
            "            max-width: 800px;\n" +
            "            margin: 20px auto;\n" +
            "            padding: 20px;\n" +
            "            background: white;\n" +
            "            border: 1px solid #dfe1e6;\n" +
            "            border-radius: 5px;\n" +
            "            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n" +
            "        }\n" +
            "        .wmpr-success {\n" +
            "            background: #e3fcef;\n" +
            "            border: 1px solid #36b37e;\n" +
            "            color: #006644;\n" +
            "            padding: 10px;\n" +
            "            border-radius: 3px;\n" +
            "            margin-bottom: 20px;\n" +
            "        }\n" +
            "        .wmpr-form-group {\n" +
            "            margin-bottom: 20px;\n" +
            "        }\n" +
            "        .wmpr-form-group label {\n" +
            "            display: block;\n" +
            "            font-weight: bold;\n" +
            "            margin-bottom: 5px;\n" +
            "            color: #172b4d;\n" +
            "        }\n" +
            "        .wmpr-radio-option {\n" +
            "            margin-bottom: 15px;\n" +
            "            padding: 15px;\n" +
            "            border: 1px solid #dfe1e6;\n" +
            "            border-radius: 3px;\n" +
            "            background: #f4f5f7;\n" +
            "        }\n" +
            "        .wmpr-radio-option input[type='radio'] {\n" +
            "            margin-right: 8px;\n" +
            "        }\n" +
            "        .wmpr-custom-jql {\n" +
            "            width: 100%;\n" +
            "            height: 80px;\n" +
            "            margin-top: 8px;\n" +
            "            padding: 8px;\n" +
            "            border: 1px solid #dfe1e6;\n" +
            "            border-radius: 3px;\n" +
            "            font-family: monospace;\n" +
            "            font-size: 12px;\n" +
            "        }\n" +
            "        .wmpr-button {\n" +
            "            padding: 8px 16px;\n" +
            "            margin-right: 10px;\n" +
            "            border: 1px solid #dfe1e6;\n" +
            "            border-radius: 3px;\n" +
            "            background: white;\n" +
            "            color: #172b4d;\n" +
            "            text-decoration: none;\n" +
            "            cursor: pointer;\n" +
            "        }\n" +
            "        .wmpr-button-primary {\n" +
            "            background: #0052cc;\n" +
            "            color: white;\n" +
            "            border-color: #0052cc;\n" +
            "        }\n" +
            "        .wmpr-code {\n" +
            "            background: #f8f9fa;\n" +
            "            padding: 8px;\n" +
            "            border-radius: 3px;\n" +
            "            font-family: monospace;\n" +
            "            font-size: 11px;\n" +
            "            color: #42526e;\n" +
            "            margin-top: 5px;\n" +
            "        }\n" +
            "    </style>\n" +
            "</head>\n" +
            "<body>\n" +
            "    <div class='wmpr-settings-container'>\n" +
            "        <h2>WMPR Settings for " + projectName + "</h2>\n" +
            "        <p>Configure how WMPR requests are displayed in the Service Desk portal.</p>\n" +
            "        \n" +
            (showSuccess ? "        <div class='wmpr-success'>\n" +
            "            ✅ <strong>Settings saved successfully!</strong> Changes will take effect immediately.\n" +
            "        </div>\n" : "") +
            "        \n" +
            "        <form method='post' class='aui'>\n" +
            "            <input type='hidden' name='projectKey' value='" + projectKey + "'>\n" +
            "            \n" +
            "            <div class='wmpr-form-group'>\n" +
            "                <label>JQL Query Configuration:</label>\n" +
            "                <p>Choose how to filter WMPR requests displayed in the portal.</p>\n" +
            "                \n" +
            "                <div class='wmpr-radio-option'>\n" +
            "                    <label>\n" +
            "                        <input type='radio' name='jqlOption' value='default' " + (!useCustomJql ? "checked" : "") + ">\n" +
            "                        <strong>Use Default Query</strong>\n" +
            "                    </label>\n" +
            "                    <div class='wmpr-code'>" + DEFAULT_JQL + "</div>\n" +
            "                    <small>Shows all issues in the WMPR project, ordered by creation date.</small>\n" +
            "                </div>\n" +
            "                \n" +
            "                <div class='wmpr-radio-option'>\n" +
            "                    <label>\n" +
            "                        <input type='radio' name='jqlOption' value='custom' " + (useCustomJql ? "checked" : "") + ">\n" +
            "                        <strong>Use Custom JQL Query</strong>\n" +
            "                    </label>\n" +
            "                    <textarea name='customJql' class='wmpr-custom-jql' placeholder='project = WMPR AND status != Done ORDER BY created DESC'>" + 
            (useCustomJql ? currentJql : "") + "</textarea>\n" +
            "                    <small>Enter your custom JQL query. Examples:<br>\n" +
            "                    • <code>project = WMPR AND status != Done ORDER BY created DESC</code><br>\n" +
            "                    • <code>project = WMPR AND reporter = currentUser() ORDER BY updated DESC</code></small>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "            \n" +
            "            <div class='aui-buttons'>\n" +
            "                <input type='submit' value='Save Settings' class='aui-button aui-button-primary'>\n" +
            "                <a href='/plugins/servlet/project-config/" + projectKey + "' class='aui-button aui-button-link'>Cancel</a>\n" +
            "            </div>\n" +
            "        </form>\n" +
            "    </div>\n" +
            "</body>\n" +
            "</html>";
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String projectKey = request.getParameter("projectKey");
        String jqlOption = request.getParameter("jqlOption");
        String customJql = request.getParameter("customJql");
        
        if (projectKey == null || projectKey.trim().isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Project key is required");
            return;
        }
        
        // Verify user has access
        JiraAuthenticationContext authContext = ComponentAccessor.getJiraAuthenticationContext();
        ApplicationUser user = authContext.getLoggedInUser();
        
        if (user == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not authenticated");
            return;
        }
        
        try {
            // Save settings - use strings instead of Boolean objects
            PluginSettingsFactory pluginSettingsFactory = getPluginSettingsFactory();
            PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            boolean useCustom = "custom".equals(jqlOption);
            
            // Save as strings to avoid Boolean serialization issues
            settings.put(SETTINGS_KEY_PREFIX + projectKey + ".useCustom", String.valueOf(useCustom));
            
            if (useCustom && customJql != null && !customJql.trim().isEmpty()) {
                settings.put(SETTINGS_KEY_PREFIX + projectKey + ".jql", customJql.trim());
            } else {
                settings.put(SETTINGS_KEY_PREFIX + projectKey + ".jql", DEFAULT_JQL);
            }
            
            // Fixed redirect URL to match servlet URL pattern
            response.sendRedirect("/plugins/servlet/wmpr-settings?projectKey=" + projectKey + "&saved=true");
        } catch (Exception e) {
            System.err.println("Error saving WMPR settings: " + e.getMessage());
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error saving settings: " + e.getMessage());
        }
    }
} 