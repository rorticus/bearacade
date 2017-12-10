const yargs = require('yargs');
const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const WebClient = require('@slack/client').WebClient;

const options = yargs
    .option('port', {
        type: 'number',
        default: 3000,
        description: 'Port number to run the web server on'
    })
    .option('scores', {
        default: 'high-scores.json',
        description: 'Location of high scores json file'
    })
    .option('slack', {
        required: true,
        description: 'Slack Web API Token'
    })
    .argv;

const adapter = new FileSync(options.scores);
const db = low(adapter);

db.defaults({
    highScores: []
}).write();

const slack = new WebClient(options.slack);