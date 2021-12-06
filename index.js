const express = require("express");
const path = require('path');
// const { IamAuthenticator } = require('ibm-cloud-sdk-core/auth');

// // Create an IAM authenticator.
// const authenticator = new IamAuthenticator({
//   apikey: '484f5fa84a0a48a6ac8def4e8ceaa888',
// });

// const options = {
//   authenticator,
//   serviceName: 'nodejs-tomas-app-cloudant-1638156843512'
// };

// const service = CloudantV1.newInstance(options);

// service.getAllDbs().then(response => {
//   console.log(response.result);
// });

const PORT = process.env.PORT || 3000;

const app = express();

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, './client/build')));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Handle GET requests to /api route
app.get("/form", (req, res) => {
  console.log(req.query)
  // console.log(res)
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});