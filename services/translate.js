const languages = require('language-list')();
const translate = require('@vitalets/google-translate-api');
const redis = require('redis');
const client = redis.createClient();
client.on('connect', function () {
    console.log('connected');
});

class TranslateService {
    /**
     * To translate a Word into the language provided as the input and from the language provided in input
     * The source and target language should be definable via the API.
     * @param { word, from_language, to_language, recommended_languages }
     */
    async translateWord({ word, from_language, to_language, recommended_languages }) {
        let key = `${word}_${from_language}`;
        return new Promise((resolve, reject) => {
            client.hgetall(key, async (err, object) => {
                if (err) {
                    return reject(err);
                }
                if (object && object[to_language]) {
                    return resolve(object[to_language])
                } else {
                    // Here only the required 'to_language's meaning will be retrieved and other recommended languages to_meaning will be processed
                    // once data is delivered to the client
                    let meaning = await translate(word, {
                        to: languages.getLanguageCode(to_language),
                        from: languages.getLanguageCode(from_language)
                    });

                    resolve(meaning.text);

                    //Setting the meaning of words for other recommended languages defined in default.json
                    // cache translations, in order to avoid repeated hits to the translation API.
                    // Asynchronously
                    return this.setMeaningForRecommendedLanguages({
                        word, from_language, to_language, recommended_languages, meaningObject: {
                            [to_language]: meaning && meaning.text
                        }
                    })
                }
            });
        });
    }

    /**
     * Setting the meaning of words for other recommended languages defined in default.json
     * Asynchronously
     * All the meaning of recommended languages will be stored in cache memory
     * @param { word, from_language, to_language, recommended_languages }
     */
    async setMeaningForRecommendedLanguages({ word, from_language, to_language, recommended_languages, meaningObject }) {
        let key = `${word}_${from_language}`;
        let parallelQuery = [];
        recommended_languages.forEach(language => {
            if (language !== to_language) {
                parallelQuery.push(translate(word, { to: languages.getLanguageCode(language), from: languages.getLanguageCode(from_language) })
                    .then((resp) => {
                        meaningObject[language] = resp && resp.text;
                    }));
            }
        });
        await Promise.all(parallelQuery);
        return new Promise((resolve, reject) => {
            client.hmset(key, meaningObject, (err, resp) => {
                if (err) {
                    return reject(err);
                }
                return resolve(resp);
            });
        });
    }
}

module.exports = new TranslateService();
