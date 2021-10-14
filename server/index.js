const express = require('express')
const cors = require('cors');

const app = express();
const port = process.env.PORT
const managerRouter = require('./routers/managerRouter')
require('./db/redis');

app.use(cors());
app.use(express.json())
app.use(managerRouter)
app.listen(port, () => {
    console.log('manager runs, port:', port)
})
