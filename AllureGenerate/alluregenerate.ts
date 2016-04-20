/// <reference path="../node_modules/Agent.Tasks/definitions/vsts-task-lib.d.ts" />

import tl = require('vsts-task-lib/task');

var allureRunner = require.resolve('allure-commandline/bin/allure');
var resultsDir = tl.getInput('resultsDir', true);
var targetDir = tl.getInput('targetDir', true);
var nodePath = tl.which('node', true);

tl.debug('allureRunner: ' + allureRunner);
tl.debug('resultsDir: ' + resultsDir);
tl.debug('targetDir: ' + targetDir);
tl.debug('nodePath: ' + nodePath);

var allure = tl.createToolRunner(nodePath);

allure.argString(allureRunner);
allure.argString('generate');
allure.argString('--output ' + targetDir);
allure.argString(resultsDir);

var result = allure.execSync();

tl.debug('Exit code: ' + result.code);
tl.debug(result.stdout);
tl.debug(result.stderr);

if (!result.code) {
    // TODO: publish artifact like it described here
    // https://github.com/Microsoft/vsts-tasks/blob/master/Tasks/PublishBuildArtifacts/publishbuildartifacts.ts
    new tl.TestPublisher('Allure').publish(targetDir, true, "", "", "", true);
}

tl.exit(result.code);
