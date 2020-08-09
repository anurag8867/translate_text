const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const port = config.get('port');
const translateService = require('./services/translate');
const languages = require('language-list')();
// Export app for other routes to use
let app = express();

// Starting point of the server

app.use(bodyParser.urlencoded({ // Middleware
    extended: true
}));
app.use(bodyParser.json());

/**
 * To Create a user
 */
app.get('/translate', async (req, res) => {
    try {
        validateRequest({ req });
        let { word, from_language, to_language } = req.query;
        let resp = await translateService.translateWord({
            word, from_language, to_language,
            recommended_languages: config.get('recommended_languages')
        });
        return res.status(resp && resp.status || 200).send({ meaning: resp });
    } catch (e) {
        return res.status(e.status || 500).send({
            message: e.message,
            error: e.error || null,
        });
    }
});

app.use(function (req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' })
});

app.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
});

function validateRequest({ req }) {
    let missingField = req.query.word ? req.query.from_language ? req.query.to_language ? null : 'toLanguage' : 'fromLanguage'
        : 'word';
    if (missingField) throw {
        message: `${missingField} field is missing from body params`,
        status: 400
    }
    let { word, from_language, to_language } = req.query;

    if (from_language === to_language) throw {
        message: `From and to Language must not be the same`,
        status: 400
    }

    if (!languages.getLanguageCode(from_language)) throw {
        message: `from_language is not supported`,
        status: 400
    }
    if (!languages.getLanguageCode(to_language)) throw {
        message: `to_language is not supported`,
        status: 400
    }
}