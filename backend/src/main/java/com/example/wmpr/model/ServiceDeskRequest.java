package com.example.wmpr.model;

public class ServiceDeskRequest {
    private String key;
    private String summary;
    private String reporter;
    private String created;
    private String status;
    private String statusCategory;

    public ServiceDeskRequest() {
    }

    public ServiceDeskRequest(String key, String summary, String reporter, String created, String status, String statusCategory) {
        this.key = key;
        this.summary = summary;
        this.reporter = reporter;
        this.created = created;
        this.status = status;
        this.statusCategory = statusCategory;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getReporter() {
        return reporter;
    }

    public void setReporter(String reporter) {
        this.reporter = reporter;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatusCategory() {
        return statusCategory;
    }

    public void setStatusCategory(String statusCategory) {
        this.statusCategory = statusCategory;
    }

    @Override
    public String toString() {
        return "ServiceDeskRequest{" +
                "key='" + key + '\'' +
                ", summary='" + summary + '\'' +
                ", reporter='" + reporter + '\'' +
                ", created='" + created + '\'' +
                ", status='" + status + '\'' +
                ", statusCategory='" + statusCategory + '\'' +
                '}';
    }
} 