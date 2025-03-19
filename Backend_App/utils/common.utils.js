const toUTCString = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}

module.exports = {toUTCString};