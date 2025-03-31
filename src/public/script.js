document.addEventListener('DOMContentLoaded', () => {
  // Set up auto-refresh
  const refreshInterval = window.REFRESH_INTERVAL || 30000;
  setInterval(refreshNodeStatuses, refreshInterval);
  
  // Add click handlers for node names and identity toggles
  setupNodeInteractions();
});

function setupNodeInteractions() {
  // Handle node name clicks (copy URL to clipboard)
  document.querySelectorAll('.node-name').forEach(nameElement => {
    nameElement.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent the card click event
      const nodeCard = nameElement.closest('.node-card');
      if (nodeCard) {
        const url = nodeCard.dataset.nodeUrl;
        copyToClipboard(url, nameElement);
      }
    });
  });
  
  // Handle identity toggle clicks
  document.querySelectorAll('.toggle-identity').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent the card click event
      const container = button.closest('.node-identity-container');
      if (container) {
        const identityValue = container.querySelector('.node-identity-value');
        const expandIcon = button.querySelector('.expand-icon');
        const collapseIcon = button.querySelector('.collapse-icon');
        
        if (identityValue.classList.contains('collapsed')) {
          // Expand
          identityValue.classList.remove('collapsed');
          identityValue.classList.add('expanded');
          identityValue.textContent = identityValue.dataset.fullIdentity;
          expandIcon.style.display = 'none';
          collapseIcon.style.display = 'inline';
        } else {
          // Collapse
          identityValue.classList.remove('expanded');
          identityValue.classList.add('collapsed');
          identityValue.textContent = identityValue.dataset.fullIdentity.substring(0, 8);
          expandIcon.style.display = 'inline';
          collapseIcon.style.display = 'none';
        }
      }
    });
  });
}

function copyToClipboard(text, triggerElement) {
  navigator.clipboard.writeText(text).then(() => {
    // Show feedback
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.textContent = 'URL copied!';
    
    // Position the feedback near the element
    const rect = triggerElement.getBoundingClientRect();
    feedback.style.top = `${rect.bottom + 5}px`;
    feedback.style.left = `${rect.left + (rect.width / 2) - 40}px`;
    
    document.body.appendChild(feedback);
    
    // Show the feedback
    setTimeout(() => feedback.classList.add('visible'), 10);
    
    // Remove the feedback after a delay
    setTimeout(() => {
      feedback.classList.remove('visible');
      setTimeout(() => document.body.removeChild(feedback), 300);
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

async function refreshNodeStatuses() {
  try {
    const response = await fetch('/api/status');
    if (!response.ok) {
      throw new Error('Failed to fetch node statuses');
    }
    
    const nodeStatuses = await response.json();
    
    // Update each node card with the latest status
    nodeStatuses.forEach(node => {
      const nodeCard = document.querySelector(`.node-card[data-node-url="${node.url}"]`);
      if (!nodeCard) return;
      
      // Update status class
      nodeCard.classList.remove('status-online', 'status-offline');
      nodeCard.classList.add(node.status === 'online' ? 'status-online' : 'status-offline');
      
      // Update status text
      const statusElement = nodeCard.querySelector('.node-status');
      if (statusElement) {
        statusElement.textContent = node.status === 'online' ? 'Online' : 'Offline';
      }
      
      // Update response time
      const responseTimeElement = nodeCard.querySelector('.node-response-time');
      if (responseTimeElement) {
        responseTimeElement.textContent = `Response: ${node.responseTime ? `${node.responseTime}ms` : 'N/A'}`;
      }
      
      // Update or add version and identity info
      const nodeInfoElement = nodeCard.querySelector('.node-info');
      if (node.status === 'online') {
        const identity = node.identity || 'Unknown';
        
        if (nodeInfoElement) {
          // Update existing info
          const versionElement = nodeInfoElement.querySelector('.node-version');
          const identityElement = nodeInfoElement.querySelector('.node-identity-value');
          
          if (versionElement) {
            versionElement.textContent = `v${node.version || 'Unknown'} ${node.version_name ? `(${node.version_name})` : ''}`;
          }
          
          if (identityElement) {
            // Update the full identity data attribute
            identityElement.dataset.fullIdentity = identity;
            
            // If it's collapsed, show only the first 8 chars
            if (identityElement.classList.contains('collapsed')) {
              identityElement.textContent = identity.substring(0, 8);
            } else {
              identityElement.textContent = identity;
            }
          }
        } else {
          // Create new info elements
          const nodeDetails = nodeCard.querySelector('.node-details');
          if (nodeDetails) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'node-info';
            
            const versionP = document.createElement('p');
            versionP.className = 'node-version';
            versionP.textContent = `v${node.version || 'Unknown'} ${node.version_name ? `(${node.version_name})` : ''}`;
            
            // Create identity container with toggle button
            const identityContainer = document.createElement('div');
            identityContainer.className = 'node-identity-container';
            
            const identityLabel = document.createElement('p');
            identityLabel.className = 'node-identity-label';
            identityLabel.textContent = 'ID:';
            
            const identityValue = document.createElement('p');
            identityValue.className = 'node-identity-value collapsed';
            identityValue.dataset.fullIdentity = identity;
            identityValue.textContent = identity.substring(0, 8);
            
            const toggleButton = document.createElement('button');
            toggleButton.className = 'toggle-identity';
            toggleButton.setAttribute('aria-label', 'Toggle full identity');
            
            const expandIcon = document.createElement('span');
            expandIcon.className = 'expand-icon';
            expandIcon.textContent = '+';
            
            const collapseIcon = document.createElement('span');
            collapseIcon.className = 'collapse-icon';
            collapseIcon.textContent = '−';
            collapseIcon.style.display = 'none';
            
            toggleButton.appendChild(expandIcon);
            toggleButton.appendChild(collapseIcon);
            
            identityContainer.appendChild(identityLabel);
            identityContainer.appendChild(identityValue);
            identityContainer.appendChild(toggleButton);
            
            infoDiv.appendChild(versionP);
            infoDiv.appendChild(identityContainer);
            nodeDetails.appendChild(infoDiv);
            
            // Add event listener to the toggle button
            toggleButton.addEventListener('click', (e) => {
              e.stopPropagation();
              if (identityValue.classList.contains('collapsed')) {
                identityValue.classList.remove('collapsed');
                identityValue.classList.add('expanded');
                identityValue.textContent = identity;
                expandIcon.style.display = 'none';
                collapseIcon.style.display = 'inline';
              } else {
                identityValue.classList.remove('expanded');
                identityValue.classList.add('collapsed');
                identityValue.textContent = identity.substring(0, 8);
                expandIcon.style.display = 'inline';
                collapseIcon.style.display = 'none';
              }
            });
          }
        }
      } else if (nodeInfoElement) {
        // Remove info section if node is offline
        nodeInfoElement.remove();
      }
    });
    
    // Update the last updated time
    const lastUpdatedElement = document.getElementById('last-updated-time');
    if (lastUpdatedElement) {
      lastUpdatedElement.textContent = new Date().toLocaleTimeString();
    }
    
    // Re-setup node interactions for any new elements
    setupNodeInteractions();
  } catch (error) {
    console.error('Error refreshing node statuses:', error);
  }
} 