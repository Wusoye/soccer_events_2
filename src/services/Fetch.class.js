//const axios = require("axios").default;
const axios = require("axios");

class Fetch {
    static async get(method, url, params, headers) {
        const options = {
            method: method,
            url: url,
            params: params,
            headers: headers
        };

        try {
            let response = await axios.request(options)
            return response
        } catch (e) {
            throw new Error(e)
        }
    }
}

module.exports = Fetch