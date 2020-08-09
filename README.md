# translate_text

    # Run :
        * npm i
        * npm start
        
    # Language : JavaScript
            * All the functions are accommodated with meaning full names which defines the functionality of the function

    # Postman Link: https://www.getpostman.com/collections/a881f38fab63bdf547dd

    # Postman Published Collection Link: https://documenter.getpostman.com/view/9881853/T1LJk8er
    
    # Github Link: https://github.com/anurag8867/translate_text

    # Points Addressed:
        * The source and target language should be definable via the API.
        * Cache translations, in order to avoid repeated hits to the translation API.
    
    # Bonus Tasks:
        * Smart pre-caching. This means we assume that if a user translates a text into Kannada, he is
          likely to also translate the same text to Hindi. Therefore we want to not only request Kannada from the external service
           but also other languages like Hindi, Tamil, etc. and store it in our cache.
           smart caching is not affecting the response time of the translation API as it's made asynchronously
           
    # Apis exposed:
            * GET
                    * Translate the word : 
                    ```curl --location --request GET 'http://localhost:3008/translate?word=warrior&from_language=english&to_language=hindi'```

# DB
    # Redis Persistent