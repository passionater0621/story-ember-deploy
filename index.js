'use strict';
var BasePlugin = require('ember-cli-deploy-plugin');
var shell = require('./utils/shell');

module.exports = {
  name: require('./package').name,

  createDeployPlugin: function (options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,
      requiredConfig: ['bucket', 'region'],

      defaultConfig: {
        ci: false
      },

      didDeploy: function (context) {
        let bucket = this.readConfig('bucket');
        let region = this.readConfig('region');
        let ci = this.readConfig('ci');
        let log = this.log.bind(this);

        let ciFlag = '';
        if (ci) {
          ciFlag = '--ci';
        }

        return shell.runCommand(
          `npx -p @storybook/storybook-deployer storybook-to-aws-s3 --bucket-path=${bucket} --aws-profile=NONE ${ciFlag} --s3-sync-options="--region=${region} --delete"`,
          true,
          log
        );
      },
    });
    return new DeployPlugin();
  },
};

