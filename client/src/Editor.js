import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import "quill/dist/quill.snow.css"
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const SAVE_INTERVAL = 5000
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
]

export default function Editor() {
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()
    const [saveStatus, setSaveStatus] = useState("")

    const { id: documentId } = useParams()

    useEffect(() => {
        const s = io("http://localhost:3001")
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return
            socket.emit("send-changes", delta)
        }
        quill.on('text-change', handler)

        return () => {
            quill.off('text-change', handler)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta) => {
            quill.updateContents(delta)
        }
        socket.on('recieve-changes', handler)

        return () => {
            socket.off('recieve-changes', handler)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        socket.once("load-document", document => {
            quill.setContents(document)
            quill.enable()
        })

        socket.emit('get-document', documentId)
    }, [socket, quill, documentId])

    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() => {
            setSaveStatus("Saving...")
            socket.emit('save-document', quill.getContents())
            setTimeout(() => setSaveStatus("All changes saved"), 1500)
        }, SAVE_INTERVAL)

        return () => {
            clearInterval(interval)
        }
    }, [socket, quill])

    const wrapper = useCallback((wrapper) => {
        if (wrapper == null) return

        wrapper.innerHTML = ""
        const e = document.createElement('div')
        wrapper.append(e)

        const q = new Quill(e, {
            theme: "snow",
            modules: { toolbar: TOOLBAR_OPTIONS },
        })
        q.disable()
        q.setText('Loading...')
        setQuill(q)
    }, [])

    return (
        <>
            <div className="container" ref={wrapper}></div>
            {saveStatus && (
                <div style={{
                    position: "fixed",
                    bottom: "10px",
                    right: "10px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    opacity: saveStatus === "Saving..." ? 1 : 0.8,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none"
                }}>
                    {saveStatus}
                </div>
            )}
        </>
    )
}
