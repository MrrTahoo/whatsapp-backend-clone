// importing
import Messages from "./dbMessages.js";
import express from 'express';
import mongoose from 'mongoose';
import Pusher from "pusher";
import cors from "cors";

// app config
const app = express();           //application instance
const port = process.env.PORT || 27017;

const pusher = new Pusher({
    appId: "1163376",
    key: "3a4a249e28d6f3195273",
    secret: "d060d4a4c69605c31fa2",
    cluster: "ap2",
    useTLS: true
});

//middleware
app.use(express.json());
app.use(cors());


// DB Config
const connection_url = 'mongodb://taha:XjBr1buSGO7QYkpC@cluster0-shard-00-00.knhzz.mongodb.net:27017,cluster0-shard-00-01.knhzz.mongodb.net:27017,cluster0-shard-00-02.knhzz.mongodb.net:27017/whatsappdb?ssl=true&replicaSet=atlas-6sn4yw-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const db = mongoose.connection;
db.once("open", () => {
    const collection = db.collection('messagecontents');
    const changeStream = collection.watch();
    changeStream.on('change', (change) => {
        console.log("done");
        if(change.operationType === "insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger("messages","inserted",{
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
            });           
        }
        else{
            console.log("error trigerring pusher");
        }
    })
}).catch(err => {
    res.send("Something wrong!!!!")
})

// ????

// api routes
// app.get('/', (req, res) => res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(200).send(data);
        }
    })
})


app.post("/messages/new", (req, res) => {
    const dbMessage = req.body;
    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(201).send(data);
        }
    });
});

// listen 
app.listen(port, () => console.log(`listening on local:${port}`))