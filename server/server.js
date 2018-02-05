const yargs = require('yargs');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
const request = require('request');
const expressWs = require('express-ws');
const fs = require('fs');

const options = yargs
    .option('port', {
        type: 'number',
        default: 3000,
        description: 'Port number to run the web server on'
    })
    .option('link', {
        default: 'http://rortic.us:3000'
    })
    .option('score', {
        type: 'number',
        default: 0,
        description: 'Default high score'
    })
    .argv;

const sessions = {};

var highScore = {
    userName: '',
    score: options.score
};

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use('/bearacade', express.static('client-dist'));
expressWs(app);

app.post('/slash-command', function (req, res, next) {
    const slackReq = req.body;

    // if(slackReq.channel_name !== 'general') {
    //     res.set('Content-Type', 'application/json');
    //     res.send(JSON.stringify({
    //         "text": "You can only start bearacade from the #general channel!"
    //     }));
    //     return;
    // }

    const startMessages = [
        'Ready to "collect" some bears? ',
        'Start the hunt. ',
        'Can you beat the highest score? ',
        'Those bears don\'t stand a chance. '
    ];
    // generate play link
    const sessionId = uuid();
    sessions[sessionId] = {
        created: Date.now(),
        userId: slackReq.user_id,
        userName: slackReq.user_name,
        responseUrl: slackReq.response_url
    };

    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify({
        "text": startMessages[Math.floor(Math.random() * startMessages.length)] + '<' + options.link + '/bearacade#session=' + sessionId + '|Play here>'
    }));
});

app.ws('/client/:clientId', function (ws, req) {
    const sessionId = req.params.clientId;

    if (sessions[sessionId]) {
        const session = sessions[sessionId];

        if (!session.connected) {
            session.connected = true;

            ws.send('start');

            ws.on('message', function (msg) {
                const score = parseInt(msg);

                var message = session.userName + ' just played Bearacade and got ' + score + ' points';

                if (score > highScore.score) {
                    if (highScore.userName !== '') {
                        message += ' AND BEAT ' + highScore.userName.toUpperCase() + '\'S HIGH SCORE OF ' + highScore.score + '!!';
                    } else {
                        message += ' AND SET A HIGH SCORE!!';
                    }

                    highScore = {
                        score: score,
                        userName: session.userName
                    };
                } else {
                    message += '!';
                }

                request({
                    uri: session.responseUrl,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: message,
                        response_type: "in_channel"
                    })
                });

                delete sessions[sessionId];
            });

            ws.on('close', function () {
                if (sessions[sessionId]) {
                    request({
                        uri: session.responseUrl,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: session.userName + ' wasn\'t doing well so they pulled the plug. shame. *SHAME*.',
                            response_type: "in_channel"
                        })
                    });

                    delete sessions[sessionId];
                }
            });
        }
    }
});

app.listen(options.port);
