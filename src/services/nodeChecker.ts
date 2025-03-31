// Service to check node status

interface NodeInfo {
  version?: string;
  version_name?: string;
  identity?: string;
  connectionString?: string;
  peerlist?: any[];
}

interface NodeStatusResult {
  success: boolean;
  responseTime?: number;
  error?: string;
  info?: NodeInfo;
}

export async function checkNodeStatus(url: string): Promise<NodeStatusResult> {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // Append /info to the URL if it doesn't already end with it
    const infoUrl = url.endsWith('/info') ? url : `${url}/info`;
    
    const response = await fetch(infoUrl, { 
      signal: controller.signal,
      method: 'GET'
    });
    
    clearTimeout(timeoutId);
    
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    if (response.ok) {
      // Parse the JSON response to get version and identity
      const info = await response.json();
      
      return {
        success: true,
        responseTime,
        info: {
          version: info.version,
          version_name: info.version_name,
          identity: info.identity,
          connectionString: info.connectionString,
          peerlist: info.peerlist
        }
      };
    } else {
      return {
        success: false,
        error: `HTTP error: ${response.status}`
      };
    }
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    return {
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 