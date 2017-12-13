'use strict';

const Express = require('express');
const Mailgun = require('mailgun-js');
const Recaptcha2 = require('recaptcha2');
const BodyParser = require('body-parser');

const PORT = 8080;
const HOST = '0.0.0.0';

const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM = process.env.MAILGUN_FROM;
const MAILGUN_TO = process.env.MAILGUN_TO;

const app = Express();
app.set('view engine', 'ejs');
app.use(BodyParser.urlencoded({extended: false}));

app.get('/', function (req, res) {
    const remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    console.log(remoteIp + ' GET /');

    //render the index.jade file - input forms for humans
    res.render('index', function (err, html) {
        if (err) {
            // log any error to the console for debug
            console.log(err);
        }
        else {
            //no error, so send the html to the browser
            res.send(html);
        }
    });
});

app.post('/', function (req, res) {
    const remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const recaptcha = new Recaptcha2({
        siteKey: RECAPTCHA_SITE_KEY,
        secretKey: RECAPTCHA_SECRET_KEY
    });

    recaptcha.validateRequest(req, remoteIp)
        .then(function () {

            const mailgun = new Mailgun({apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN});

            const data = {
                from: MAILGUN_FROM,
                to: MAILGUN_TO,
                subject: 'Formmail',
                text: req.body['for'] + ' requested from ' + req.body['email']
            };

            mailgun.messages().send(data, function (error, body) {
                if (error) {
                    console.log(remoteIp + ' ERROR ' + error);
                    res.send('An error occurred, please try again later');
                } else {
                    console.log(remoteIp + ' OK');
                    res.send('Request sent: ' + req.body['for']);
                }
            });
        })
        .catch(function (errorCodes) {
            console.log(remoteIp + ' ERROR ' + errorCodes);
            res.send('An error occurred, please try again later');
        });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
