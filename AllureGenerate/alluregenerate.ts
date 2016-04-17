/// <reference path="../node_modules/Agent.Tasks/definitions/vsts-task-lib.d.ts" />

import tl = require('vsts-task-lib/task');
import path = require('path');

var allureRunner = tl.getInput('allureRunner', false);
if(!allureRunner) {
    allureRunner = require.resolve('allure-commadline/bin/allure');
}
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

allure.exec()
    .then(function(code) {
        new tl.TestPublisher('Allure').publish(targetDir, true, "", "", "", true);
        tl.exit(code);
    })
    .fail(function(err) {
        console.error(err.message);
        tl.debug('report generation failed');
        tl.exit(1);
    });
