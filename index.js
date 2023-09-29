const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const request = require("request");
const { pages } = require("./config");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

morgan(":method :url :status :res[content-length] - :response-time ms");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 287223757418787;

  console.log(req.query, VERIFY_TOKEN);

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      console.log(
        "Responds with '403 Forbidden' if verify tokens do not match"
      );
      res.sendStatus(403);
    }
  }
  console.log("Responds with '403 Forbidden' if verify tokens do not match");
  res.sendStatus(403);
});

app.post("/webhook", (req, res) => {
  let body = req.body;
  console.log(body, pages);

  const pageID = body?.entry && body?.entry.length ? body?.entry[0].id : null;
  console.log({ pageID });
  if (pageID && pages[pageID]) {
    console.log(pages[pageID]);
    request.post(
      {
        url: pages[pageID],
        json: body,
        headers: { "Content-Type": "application/json" },
      },
      (error, res, result) => {
        console.log({ result });
      }
    );
  }
  res.send("Ok");
});

app.use((error, request, response, next) => {
  // Error handling middleware functionality
  console.log(`error ${error.message}`); // log the error
  const status = error.status || 400;
  // send back an easily understandable error message to the caller
  response.status(status).send({
    status: status,
    message: error.message,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
