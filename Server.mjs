import { app } from "./index.mjs"
import http from "http"


const server = http.createServer(app)


server.listen(5000, ()=>{
    console.log("server is running")
})