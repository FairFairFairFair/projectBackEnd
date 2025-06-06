import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import productRoute from "./routes/productRoute.js";
import memberRoute from "./routes/memberRoute.js"
import cartRoute from "./routes/cartRoute.js"
import pokeRoute from "./routes/pokeRoute.js"
import moveRoute from "./routes/moveRoute.js"
import teamRoute from "./routes/teamRoute.js"
import pokeMoveRoute from "./routes/pokeMoveRoute.js"

import cors from "cors"
// import ส่วนที่ติดตั้งเข้ามา
import swaggerUI from "swagger-ui-express"
import yaml from "yaml"
// ใช้ File
import fs from "fs"

dotenv.config()

const app = express()
const PORT = process.env.PORT
// const {Pool} = pkg
app.use(bodyParser.json())

// เรียกใช้ cors
// app.use(cors())
// กำหนด Option ของ cors เพิ่มเติมเมื่อมีการส่งข้อมูล Cookie หรือ Header
app.use(cors({
    origin:['http://localhost:5173','http://127.0.0.1:5173'], //Domain ของ Frontend
    methods:['GET','POST','PUT','DELETE'], //Method ที่อนุญาต
    credentials:true  //ให้ส่งข้อมูล Header+Cookie ได้
}))

//เรียกใช้โหลเดอร์รูปภาพ
app.use("/img_pd",express.static("img_pd"))
app.use("/img_poke",express.static("img_poke"))
app.use("/img_mem",express.static("img_mem"))

app.use(productRoute)

app.use(pokeMoveRoute)
app.use(teamRoute)
app.use(pokeRoute)
app.use(moveRoute)

app.use(memberRoute)
app.use(cartRoute)

// swagger
const swaggerfile = fs.readFileSync('service/swagger.yaml','utf-8')
const swaggerDoc = yaml.parse(swaggerfile)
// กำหนด path ที่จะให้เรียกหน้า Document ขึ้นมา
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDoc))

app.get('/',(req,res)=>{
    console.log(`GET / requested`)
    res.status(200).json(
        {message:"Request OK"}
    )
})

app.listen(PORT,()=>{
    console.log(`Server is running on PORT : http://localhost:${PORT}/`)
})