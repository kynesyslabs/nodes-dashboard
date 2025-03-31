import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from './config';
import { renderDashboard } from './templates/dashboard';
import { checkNodeStatus } from './services/nodeChecker';

// Determine the base directory for static files
const isProduction = process.env.NODE_ENV === 'production';
const baseDir = isProduction 
  ? join(import.meta.dir, 'public') 
  : join(import.meta.dir, 'public');

// Initialize the server
const app = new Elysia()
  .use(html())
  .get('/styles.css', () => {
    return new Response(
      readFileSync(join(baseDir, 'styles.css'), 'utf-8'),
      {
        headers: {
          'Content-Type': 'text/css',
        },
      }
    );
  })
  .get('/script.js', () => {
    return new Response(
      readFileSync(join(baseDir, 'script.js'), 'utf-8'),
      {
        headers: {
          'Content-Type': 'application/javascript',
        },
      }
    );
  })
  .get('/', async () => {
    const nodeStatuses = await Promise.all(
      config.nodes.map(async (node) => {
        const status = await checkNodeStatus(node.url);
        return {
          ...node,
          status,
          responseTime: status.success ? status.responseTime : null,
        };
      })
    );

    return renderDashboard(nodeStatuses, config);
  })
  .get('/api/status', async () => {
    const nodeStatuses = await Promise.all(
      config.nodes.map(async (node) => {
        const status = await checkNodeStatus(node.url);
        return {
          name: node.name,
          url: node.url,
          network: node.network,
          status: status.success ? 'online' : 'offline',
          responseTime: status.success ? status.responseTime : null,
          version: status.info?.version,
          version_name: status.info?.version_name,
          identity: status.info?.identity
        };
      })
    );

    return nodeStatuses;
  })
  .listen(config.port);

console.log(`🚀 Server is running at http://localhost:${config.port}`); 