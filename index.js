/**
 * @type {[MundoAPI]}
 */
let SessionMundo = [];

const checkEventMundo = require('./Helper/checkEventMundo');
const middlewareRequestToken = require('./Helper/middlewareRequestToken');
const express = require('express');
const MundoAPI = require('./Helper/mundoAPI');
const app = express();
app.use(express.json({ extended: false }));


app.get('/',
    function (req, res) {
        res.status(200).json({ result: 'ok' }).end();
        return;
    }
);

app.get('/create',
    middlewareRequestToken,
    async function (req, res) {
        try {
            const { token, start } = req.query;
            if (SessionMundo.filter(where => (where.TokenId === token)).length === 0) {
                const reqMundo = new MundoAPI(token);
                await reqMundo.setMundoProfile();
                if (start === 'true') { await reqMundo.setMundoFreeDice(); }
                SessionMundo.push(reqMundo);
                res.status(201).json({ result: 'ok', token: token, status: 'created' });
                return;
            }
            else {
                res.status(200).json({ result: 'ok', token: token, status: 'exists' }).end();
                return;
            }
        } catch (error) {
            console.error(error);
            res.status(422).json({ result: 'error', error: 'ERROR_UNPROCESSENTITY' });
            return;
        }
    }
);

app.get('/status',
    middlewareRequestToken,
    function (req, res) {
        const { token } = req.query;
        const findResult = SessionMundo.filter(where => (where.TokenId === token));
        if (findResult.length === 0) {
            res.status(200).json({ result: 'error', error: "ERROR_TOKEN_NOTFOUND" });
            return;
        }
        else {
            res.status(200).json(SessionMundo[0]).end();
            return;
        }
    }
);

app.get('/start',
    middlewareRequestToken,
    async function (req, res) {
        try {
            const { token } = req.query;
            const findResult = SessionMundo.filter(where => (where.TokenId === token));
            if (findResult.length === 0) {
                res.status(200).json({ result: 'error', error: "ERROR_TOKEN_NOTFOUND" });
                return;
            }
            else {
                await SessionMundo[0].setMundoFreeDice();
                res.status(200).json({ result: 'ok', token: token, status: 'started' }).end();
                return;
            }
        } catch (error) {
            res.status(422).json({ result: 'error', error: 'ERROR_UNPROCESSENTITY' });
            return;
        }
    }
);

app.get('/stop',
    middlewareRequestToken,
    function (req, res) {
        try {
            const { token } = req.query;
            const findResult = SessionMundo.filter(where => (where.TokenId === token));
            if (findResult.length === 0) {
                res.status(200).json({ result: 'error', error: "ERROR_TOKEN_NOTFOUND" });
                return;
            }
            else {
                SessionMundo[0].clearMundoFreeDice();
                res.status(200).json({ result: 'ok', token: token, status: 'stoped' }).end();
                return;
            }
        } catch (error) {
            res.status(422).json({ result: 'error', error: 'ERROR_UNPROCESSENTITY' });
            return;
        }
    }
);

app.get('/delete',
    middlewareRequestToken,
    async function (req, res) {
        try {
            const { token } = req.query;
            const findResult = SessionMundo.findIndex(where => (where.TokenId === token));
            if (findResult === -1) {
                res.status(200).json({ result: 'error', error: "ERROR_TOKEN_NOTFOUND" });
                return;
            }
            else {
                SessionMundo[findResult].clearMundoFreeDice();
                SessionMundo.splice(findResult, 1);
                res.status(200).json({ result: 'ok', token: token, status: 'deleted' }).end();
                return;
            }
        } catch (error) {
            res.status(422).json({ result: 'error', error: 'ERROR_UNPROCESSENTITY' });
            return;
        }
    }
);

app.use(function (req, res, next) {
    res.status(404).json({ result: 'error', error: "ERROR_NOTFOUND" });
    return;
});

checkEventMundo().then(() => {
    const HTTP_PORT = process.env.PORT || 8080;
    app.listen(HTTP_PORT, () => console.log(`Server is running in port ${HTTP_PORT}`));
});