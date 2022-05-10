const {Core} = require('@mocks-server/core')
const AdminApi = require('@mocks-server/plugin-admin-api')
const InquirerCli = require('@mocks-server/plugin-inquirer-cli')
const mocksConfig = require('./mocks.config')
const {parsed} = require('dotenv').config()

process.env.BACK_KIT_VERSION = 'unstable'
if(Object.keys(parsed).includes('BACK_KIT_VERSION')) {
  process.env.BACK_KIT_VERSION = parsed['BACK_KIT_VERSION']
}

const mocksServer = new Core({
  onlyProgrammaticOptions: false,
  plugins: [AdminApi, InquirerCli]
})

mocksServer
  .init(mocksConfig)
  .then(() => mocksServer.start())
