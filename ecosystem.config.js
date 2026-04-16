module.exports = {
  apps: [
    {
      name: 'miradeen',
      script: '.next/standalone/server.js',
      cwd: '/home/miradeen',  // CHANGE THIS to your project path on Hostinger VPS
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'file:/home/miradeen/db/custom.db',
        JWT_SECRET: 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_STRING',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/miradeen/logs/error.log',
      out_file: '/home/miradeen/logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
