let tempSession,
    session = {};

module.exports = () => (req, res, next) => {
    req.session = tempSession || session;
    tempSession = null;
    next();
};

// in the test we will run it like that:
// cookieSession.mockSession({
//     submitted: true
// });

module.exports.mockSession = sess => (session = sess);

module.exports.mockSessionOnce = sess => (tempSession = sess);
