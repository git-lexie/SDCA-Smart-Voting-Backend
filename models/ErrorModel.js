
class HttpError extends Error {
    constructor (MessageChannel, errorCode){
        super(message);
        this.code = errorCode;
    }
}

module.exports = HttpError;