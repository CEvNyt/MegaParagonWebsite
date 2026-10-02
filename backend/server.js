// Compatibility entry point for npm start in the backend folder.
const server = require("../serve");
const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`http://localhost:${port}/home`));
