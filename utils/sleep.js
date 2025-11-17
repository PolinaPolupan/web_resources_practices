module.exports = function sleep() {
    return new Promise(resolve => setTimeout(resolve, 0));
}
