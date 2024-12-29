const app = require("./server")
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Example app listening to ${port}`);
});


module.exports = app;