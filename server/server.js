const mongoose = require("mongoose")
const Document = require("./Document")

mongoose.connect('mongodb://127.0.0.1:27017/real-time-editor', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
    }, 
})

io.on("connection", socket => {
    console.log("connected")

    socket.on('get-document', async documentId => {
        const document = await find(documentId)
        socket.join(documentId)
        socket.emit('load-document', document.data)

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("recieve-changes", delta)
        })

        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, { data })
        })
    })
})

async function find(id) {
    if (id == null) return

    const document = await Document.findById(id)

    if (document) return document
    return await Document.create({_id: id, data: ""})

}