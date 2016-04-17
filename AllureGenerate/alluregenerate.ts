/// <reference path="../node_modules/Agent.Tasks/definitions/vsts-task-lib.d.ts" />

import tl = require('vsts-task-lib/task');

var allureRunner = tl.getInput('allureRunner', true);
var resultsDir = tl.getInput('resultsDir', true);
var targetDir = tl.getInput('targetDir', true);

tl.debug('allureRunner: ' + allureRunner);
tl.debug('resultsDir: ' + resultsDir);
tl.debug('targetDir: ' + targetDir);

var allure = tl.createToolRunner(allureRunner);

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
