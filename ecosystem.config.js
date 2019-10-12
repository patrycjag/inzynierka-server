module.exports = {
  apps: [{
    name: 'inzynierka-server',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-35-180-69-117.eu-west-3.compute.amazonaws.com',
      key: '~/Desktop/UbuntuServer.pem',
      ref: 'origin/master',
      repo: 'git@github.com:patrycjag/inzynierka-server.git',
      path: '~/inzynierka-server',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
