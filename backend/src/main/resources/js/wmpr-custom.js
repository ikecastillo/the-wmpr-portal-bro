/**
 * WMPR Custom JavaScript - Enhanced UI Interactions
 * Provides enhanced user experience for the Service Desk portal
 */

(function(AJS, $) {
    'use strict';

    // Initialize when DOM is ready
    AJS.toInit(function() {
        console.log('[WMPR Custom JS] Initializing custom interactions...');
        
        // Initialize all enhancements
        initClickableListItems();
        initSmartTooltips();
        initKeyboardNavigation();
        initLoadingEnhancements();
        initAnalytics();
        
        console.log('[WMPR Custom JS] All enhancements initialized');
    });

    /**
     * Make entire list items clickable for request types
     * This addresses the user's request to make the whole card clickable
     */
    function initClickableListItems() {
        console.log('[WMPR Custom JS] Initializing clickable list items...');
        
        // Function to handle list item clicks
        function makeListItemClickable() {
            const listItems = document.querySelectorAll('.cv-landing-list > li');
            
            listItems.forEach(function(item) {
                // Skip if already processed
                if (item.classList.contains('wmpr-clickable-processed')) {
                    return;
                }
                
                // Find the main link within the item
                const mainLink = item.querySelector('.cv-request-type[href], a[href]');
                if (!mainLink) {
                    return;
                }
                
                const linkUrl = mainLink.getAttribute('href');
                
                // Make the entire item clickable
                item.style.cursor = 'pointer';
                item.setAttribute('role', 'button');
                item.setAttribute('tabindex', '0');
                item.setAttribute('aria-label', 'Open ' + (mainLink.textContent || '').trim());
                
                // Add click handler
                item.addEventListener('click', function(e) {
                    // Ignore if clicked on a nested interactive element
                    if (e.target.closest('a, button, input, select, textarea')) {
                        return;
                    }
                    
                    e.preventDefault();
                    
                    // Add visual feedback
                    item.style.transform = 'scale(0.98)';
                    setTimeout(function() {
                        item.style.transform = '';
                    }, 150);
                    
                    // Navigate to the link
                    if (linkUrl) {
                        window.location.href = linkUrl;
                    }
                });
                
                // Add keyboard support
                item.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        item.click();
                    }
                });
                
                // Add visual feedback for hover and focus
                item.addEventListener('mouseenter', function() {
                    item.style.transform = 'translateY(-2px)';
                });
                
                item.addEventListener('mouseleave', function() {
                    item.style.transform = '';
                });
                
                item.addEventListener('focus', function() {
                    item.style.outline = '2px solid #0052cc';
                    item.style.outlineOffset = '2px';
                });
                
                item.addEventListener('blur', function() {
                    item.style.outline = '';
                    item.style.outlineOffset = '';
                });
                
                // Mark as processed
                item.classList.add('wmpr-clickable-processed');
                
                console.log('[WMPR Custom JS] Made list item clickable:', linkUrl);
            });
        }
        
        // Initial setup
        makeListItemClickable();
        
        // Watch for dynamically added content
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && 
                            (node.classList.contains('cv-landing-list') || 
                             node.querySelector('.cv-landing-list'))) {
                            shouldUpdate = true;
                        }
                    });
                }
            });
            
            if (shouldUpdate) {
                setTimeout(makeListItemClickable, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Add smart tooltips for truncated text and additional info
     */
    function initSmartTooltips() {
        console.log('[WMPR Custom JS] Initializing smart tooltips...');
        
        function addTooltips() {
            // Add tooltips to truncated summaries
            const summaryElements = document.querySelectorAll('.cv-request-type strong, .cv-request-type-description');
            
            summaryElements.forEach(function(element) {
                if (element.scrollWidth > element.clientWidth || 
                    element.scrollHeight > element.clientHeight) {
                    
                    element.setAttribute('title', element.textContent.trim());
                    element.style.cursor = 'help';
                }
            });
        }
        
        // Initial setup and periodic checks
        addTooltips();
        setInterval(addTooltips, 2000);
    }

    /**
     * Enhanced keyboard navigation
     */
    function initKeyboardNavigation() {
        console.log('[WMPR Custom JS] Initializing keyboard navigation...');
        
        document.addEventListener('keydown', function(e) {
            // Arrow key navigation for grid items
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                const focused = document.activeElement;
                const gridItems = Array.from(document.querySelectorAll('.cv-landing-list > li[tabindex="0"]'));
                const currentIndex = gridItems.indexOf(focused);
                
                if (currentIndex === -1) return;
                
                let nextIndex;
                const itemsPerRow = Math.floor(document.querySelector('.cv-landing-list').offsetWidth / 340);
                
                switch (e.key) {
                    case 'ArrowRight':
                        nextIndex = Math.min(currentIndex + 1, gridItems.length - 1);
                        break;
                    case 'ArrowLeft':
                        nextIndex = Math.max(currentIndex - 1, 0);
                        break;
                    case 'ArrowDown':
                        nextIndex = Math.min(currentIndex + itemsPerRow, gridItems.length - 1);
                        break;
                    case 'ArrowUp':
                        nextIndex = Math.max(currentIndex - itemsPerRow, 0);
                        break;
                }
                
                if (nextIndex !== undefined && nextIndex !== currentIndex) {
                    e.preventDefault();
                    gridItems[nextIndex].focus();
                }
            }
        });
    }

    /**
     * Enhanced loading states and animations
     */
    function initLoadingEnhancements() {
        console.log('[WMPR Custom JS] Initializing loading enhancements...');
        
        // Add skeleton loading for WMPR requests
        const wmprPanel = document.getElementById('wmpr-requests-panel');
        if (wmprPanel) {
            const reactContainer = document.getElementById('wmpr-react-table');
            if (reactContainer) {
                // Add loading class for smooth transitions
                reactContainer.classList.add('wmpr-loading-enhanced');
            }
        }
        
        // Staggered animation for grid items
        function animateGridItems() {
            const items = document.querySelectorAll('.cv-landing-list > li');
            items.forEach(function(item, index) {
                if (!item.classList.contains('wmpr-animated')) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    
                    setTimeout(function() {
                        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                        item.classList.add('wmpr-animated');
                    }, index * 50);
                }
            });
        }
        
        // Animate items when they appear
        setTimeout(animateGridItems, 100);
        
        // Watch for new items
        const observer = new MutationObserver(function() {
            setTimeout(animateGridItems, 100);
        });
        
        const landingList = document.querySelector('.cv-landing-list');
        if (landingList) {
            observer.observe(landingList, { childList: true });
        }
    }

    /**
     * Basic analytics and usage tracking
     */
    function initAnalytics() {
        console.log('[WMPR Custom JS] Initializing analytics...');
        
        // Track clicks on request types
        document.addEventListener('click', function(e) {
            const requestType = e.target.closest('.cv-request-type');
            if (requestType) {
                const title = requestType.querySelector('strong');
                if (title) {
                    console.log('[WMPR Analytics] Request type clicked:', title.textContent.trim());
                    
                    // Send to analytics if available
                    if (window.ga) {
                        ga('send', 'event', 'ServiceDesk', 'RequestTypeClick', title.textContent.trim());
                    }
                }
            }
        });
        
        // Track WMPR panel interactions
        const wmprPanel = document.getElementById('wmpr-requests-panel');
        if (wmprPanel) {
            wmprPanel.addEventListener('click', function(e) {
                if (e.target.closest('.wmpr-issue-key')) {
                    console.log('[WMPR Analytics] WMPR request clicked');
                    
                    if (window.ga) {
                        ga('send', 'event', 'WMPR', 'RequestClick', 'Footer');
                    }
                }
            });
        }
    }

    /**
     * Utility function to enhance form interactions
     */
    function initFormEnhancements() {
        console.log('[WMPR Custom JS] Initializing form enhancements...');
        
        // Enhanced focus states for forms
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(function(input) {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('wmpr-focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('wmpr-focused');
            });
        });
    }

    /**
     * Performance monitoring
     */
    function initPerformanceMonitoring() {
        console.log('[WMPR Custom JS] Initializing performance monitoring...');
        
        // Monitor page load performance
        window.addEventListener('load', function() {
            setTimeout(function() {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    console.log('[WMPR Performance] Page load time:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
                }
            }, 0);
        });
    }

    // Initialize additional features when needed
    setTimeout(function() {
        initFormEnhancements();
        initPerformanceMonitoring();
    }, 1000);

    // Expose utilities for other scripts
    window.WMPR = window.WMPR || {};
    window.WMPR.customJS = {
        makeListItemClickable: initClickableListItems,
        refreshTooltips: initSmartTooltips,
        version: '1.0.0'
    };

})(AJS, AJS.$);

/**
 * Legacy support for older browsers
 */
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

console.log('[WMPR Custom JS] Module loaded successfully'); 