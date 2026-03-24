module.exports = {
  apps: [
    {
      name: 'foundation-app',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=foundation-db --local --ip 0.0.0.0 --port 3000',
      cwd: '/home/user/foundation-app',
      env: { NODE_ENV: 'development' },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
