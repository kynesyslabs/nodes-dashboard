// Configuration module to load and parse environment variables

interface Node {
  name: string;
  url: string;
  network: string; // Changed from enum to string to support dynamic networks
}

interface Config {
  port: number;
  nodes: Node[];
  refreshInterval: number;
  siteTitle: string;
}

// Parse nodes from a specific environment variable
const parseNodesFromEnv = (envVar: string, defaultNetwork?: string): Node[] => {
  const nodesString = process.env[envVar];
  if (!nodesString) return [];
  
  return nodesString.split(',').map(nodeStr => {
    const parts = nodeStr.split('|');
    
    // If we have 3 parts, use the third as network, otherwise use the default
    if (parts.length === 3) {
      const [name, url, network] = parts;
      
      if (!name || !url) {
        throw new Error(`Invalid node configuration: ${nodeStr}`);
      }
      
      return { name, url, network };
    } 
    // If we have 2 parts and a default network, use the default network
    else if (parts.length === 2 && defaultNetwork) {
      const [name, url] = parts;
      
      if (!name || !url) {
        throw new Error(`Invalid node configuration: ${nodeStr}`);
      }
      
      return { name, url, network: defaultNetwork };
    }
    else {
      throw new Error(`Invalid node configuration: ${nodeStr}`);
    }
  });
};

// Collect all nodes from different network environment variables
const collectAllNodes = (): Node[] => {
  const nodes: Node[] = [];
  
  // Get all environment variables that end with _NODES
  const nodeEnvVars = Object.keys(process.env).filter(key => key.endsWith('_NODES'));
  
  // For each environment variable, parse the nodes and add them to the list
  nodeEnvVars.forEach(envVar => {
    // Extract network name from environment variable (e.g., DEVNET_NODES -> devnet)
    const networkName = envVar.replace('_NODES', '').toLowerCase();
    const networkNodes = parseNodesFromEnv(envVar, networkName);
    nodes.push(...networkNodes);
  });
  
  // Also check for the legacy NODES variable for backward compatibility
  if (process.env.NODES) {
    const legacyNodes = parseNodesFromEnv('NODES');
    nodes.push(...legacyNodes);
  }
  
  return nodes;
};

// Load configuration from environment variables
export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodes: collectAllNodes(),
  refreshInterval: parseInt(process.env.REFRESH_INTERVAL || '30000', 10),
  siteTitle: process.env.SITE_TITLE || 'Node Status Dashboard'
}; 