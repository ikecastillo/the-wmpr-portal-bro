package com.example.wmpr.webpanel;

import com.atlassian.jira.plugin.webfragment.contextproviders.AbstractJiraContextProvider;
import com.atlassian.jira.plugin.webfragment.model.JiraHelper;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.plugin.PluginParseException;

import java.util.HashMap;
import java.util.Map;

/**
 * Simple web panel for WMPR requests
 * Extends AbstractJiraContextProvider to work with Jira's web panel framework
 */
public class WMPRRequestsWebPanel extends AbstractJiraContextProvider {
    
    @Override
    public void init(Map params) throws PluginParseException {
        // No special initialization needed for our simple panel
    }
    
    @Override
    public Map getContextMap(ApplicationUser user, JiraHelper jiraHelper) {
        // Return a simple context map - Velocity template can access standard Jira variables automatically
        Map<String, Object> context = new HashMap<>();
        // The framework will add standard variables like $authContext, $date, etc.
        return context;
    }
} 