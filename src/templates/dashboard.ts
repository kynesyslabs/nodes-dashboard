// Template for rendering the dashboard HTML

interface NodeStatus {
  name: string;
  url: string;
  network: string; // Changed from enum to string
  status: {
    success: boolean;
    responseTime?: number;
    error?: string;
    info?: {
      version?: string;
      version_name?: string;
      identity?: string;
      connectionString?: string;
      peerlist?: any[];
    };
  };
  responseTime: number | null;
}

interface Config {
  refreshInterval: number;
  siteTitle: string;
}

export function renderDashboard(nodes: NodeStatus[], config: Config): string {
  // Group nodes by network
  const networkGroups = groupNodesByNetwork(nodes);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.siteTitle}</title>
      <link rel="stylesheet" href="/styles.css">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    </head>
    <body>
      <div class="container">
        <header>
          <h1>${config.siteTitle}</h1>
          <p class="last-updated">Last updated: <span id="last-updated-time">${new Date().toLocaleTimeString()}</span></p>
        </header>
        
        <main>
          ${renderNetworkSections(networkGroups)}
        </main>
        
        <footer>
          <p>Auto-refreshes every ${config.refreshInterval / 1000} seconds</p>
        </footer>
      </div>
      
      <script>
        // Set the refresh interval from the server config
        window.REFRESH_INTERVAL = ${config.refreshInterval};
      </script>
      <script src="/script.js"></script>
    </body>
    </html>
  `;
}

// Group nodes by their network type
function groupNodesByNetwork(nodes: NodeStatus[]): Record<string, NodeStatus[]> {
  const groups: Record<string, NodeStatus[]> = {};
  
  nodes.forEach(node => {
    if (!groups[node.network]) {
      groups[node.network] = [];
    }
    groups[node.network].push(node);
  });
  
  return groups;
}

// Render all network sections
function renderNetworkSections(networkGroups: Record<string, NodeStatus[]>): string {
  // Sort network names to ensure consistent order
  const networkNames = Object.keys(networkGroups).sort();
  
  return networkNames.map(network => {
    const nodes = networkGroups[network];
    return renderNetworkSection(formatNetworkName(network), nodes);
  }).join('');
}

// Format network name for display (capitalize, replace hyphens with spaces)
function formatNetworkName(network: string): string {
  return network
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function renderNetworkSection(networkName: string, nodes: NodeStatus[]): string {
  if (nodes.length === 0) {
    return '';
  }

  return `
    <section class="network-section">
      <h2>${networkName}</h2>
      <div class="nodes-grid">
        ${nodes.map(node => renderNodeCard(node)).join('')}
      </div>
    </section>
  `;
}

function renderNodeCard(node: NodeStatus): string {
  const statusClass = node.status.success ? 'status-online' : 'status-offline';
  const statusText = node.status.success ? 'Online' : 'Offline';
  const responseTime = node.responseTime ? `${node.responseTime}ms` : 'N/A';
  
  // Get version and identity from the node status info
  const version = node.status.info?.version || 'Unknown';
  const versionName = node.status.info?.version_name || '';
  const identity = node.status.info?.identity || 'Unknown';

  return `
    <div class="node-card ${statusClass}" data-node-url="${node.url}" data-network="${node.network}">
      <div class="node-header">
        <h3 class="node-name">${node.name}</h3>
        <span class="status-indicator"></span>
      </div>
      <div class="node-details">
        <p class="node-url">${node.url}</p>
        <p class="node-status">${statusText}</p>
        <p class="node-response-time">Response: ${responseTime}</p>
        ${node.status.success ? `
        <div class="node-info">
          <p class="node-version">v${version} ${versionName ? `(${versionName})` : ''}</p>
          <div class="node-identity-container">
            <p class="node-identity-label">ID:</p>
            <p class="node-identity-value collapsed" data-full-identity="${identity}">${identity.substring(0, 8)}</p>
            <button class="toggle-identity" aria-label="Toggle full identity">
              <span class="expand-icon">+</span>
              <span class="collapse-icon" style="display:none;">−</span>
            </button>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
} 