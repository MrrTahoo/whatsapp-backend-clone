// importing
import Messages from "./dbMessages.js";
import express from 'express';
import mongoose from 'mongoose';
import Pusher from "pusher";



// app config
const app = express();           //application instance
const port = process.env.PORT || 9000;

const pusher = new Pusher ({
    appId: "1163376",
    key: "3a4a249e28d6f3195273",
    secret: "d060d4a4c69605c31fa2",
    cluster: "ap2",
    useTLS: true
});

//middleware
app.use(express.json())



// DB Config
const connection_url = 'mongodb+srv://taha:XjBr1buSGO7QYkpC@cluster0.knhzz.mongodb.net/whatsappdb?retryWrites=true&w=majority';
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
        console.log("done",change);

        if(change.operationType === "insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger("messages","inserted",{
                name: messageDetails.name,
                message: messageDetails.message,
            });           
        }
        else{
            console.log("error trigerring pusher");
        }
    });
});

// ????

// api routes
app.get('/', (req, res) => res.status(200).send('hello world'));

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