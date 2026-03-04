module.exports = {
  apps: [
    {
      // Application name
      name: 'unified-produce-b2b',

      // Entry script
      script: './dist/server.js',

      // Node arguments
      node_args: '--max-old-space-size=1024',

      // Environment variables for development
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },

      // Environment variables for production
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Cluster mode for production
      instances: '3',
      exec_mode: 'cluster',

      // Auto restart on file changes
      watch: false,

      // Ignore these paths
      ignore_watch: ['node_modules', 'logs', 'uploads', '.git', 'dist'],

      // Extensions to watch
      watch_extensions: 'ts,js',

      // Auto restart delay
      wait_ready: true,
      listen_timeout: 5000,

      // Kill timeout
      kill_timeout: 5000,

      // Max memory allowed
      max_memory_restart: '1G',

      // Log files
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_file: './logs/combined.log',

      // Merge logs from cluster instances
      merge_logs: true,

      // Auto restart
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Arguments
      args: '',

      // Cron restart
      cron_restart: '0 0 * * *',

      // Graceful shutdown
      stop_exit_codes: [0],
      kill_session: true,
    },
  ],

  // Deploy configuration
  deploy: {
    production: {
      user: 'node',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/muhammadranju/unified-produce-b2b.git',
      path: '/var/www/unified-produce-b2b',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.cjs --env production',
    },
    staging: {
      user: 'node',
      host: 'your-staging-server.com',
      ref: 'origin/develop',
      repo: 'https://github.com/muhammadranju/unified-produce-b2b.git',
      path: '/var/www/unified-produce-b2b-staging',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.cjs --env staging',
    },
  },
};
