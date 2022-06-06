const express = require("express")
const fs = require("fs")
const {randomUUID} =  require("crypto")
const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("Welcome")
})

app.post("/user/create",(req,res,next)=>{
    if((req.body.role)==="candidate"){
        if(!req.body.vote && !req.body.party){
          return  res.status(400).send("Vote and party does not exist")
        }else{
            fs.readFile("./db.json","utf-8",(err,data)=>{
                let parsed = JSON.parse(data)
                parsed.users = [...parsed.users,req.body]

                fs.writeFile("./db.json",JSON.stringify(parsed),"utf-8",()=>{
                    return  res.send("User Added")
                })
            })
        }
    }
    else if((req.body.role)==="voter"){
        if(!req.body.username && !req.body.password){
            return  res.status(400).send("please login")
        }else{
            fs.readFile("./db.json","utf-8",(err,data)=>{
                let parsed = JSON.parse(data)
                parsed.users = [...parsed.users,req.body]

                fs.writeFile("./db.json",JSON.stringify(parsed),"utf-8",()=>{
                    return  res.send("User Added")
                })
            })
        } 
    }
    next();
})

app.post("/user/login",(req,res,next)=>{
    if((req.body.role)==="voter"){
        if(!req.body.username || !req.body.password){
            return res.status(400).send("please provide username and password")
        }
        else{
            fs.readFile("./db.json","utf-8",(err,data)=>{
                let parsed = JSON.parse(data)
                let flag=false;
                for(let i=0;i<parsed.users.length;i++){
                    let token = randomUUID()
                    fs.write("./db.json",JSON.stringify(parsed),{encoding:"utf-8"},()=>{
                        return res.status(201).send(JSON.stringify({stauts:"Login successfully",token}))
                    })
                }
            })
        }
    }
})

app.get("/votes/party/:party",(req,res)=>{
    let token = req.query.apikey;
    let {party} = req.params;
    if(!token){
        return res.status(401).send("need API")
    }
    fs.readFile("./db.json","utf-8",(err,data)=>{
        let parsed = JSON.parse(data)
        let result = parsed.users.filter((e)=>{
            return e.party==party
        })
        return res.json(result)
    })
})

app.get("/votes/voters",(req,res)=>{
    let token = req.query.apikey;
    if(!token){
        return res.status(401).send("need API")
    }
    fs.readFile("./db.json","utf-8",(err,data)=>{
        let parsed = JSON.parse(data)
        let result = parsed.users.filter((e)=>{
            return e.role=="voter"
        })
        return res.json(result)
    })
})

app.post("/votes/vote/:user",(req,res)=>{
    let token = req.query.apikey
    let user = req.params.user
    if(!token){
        return res.status(401).send("need apikey")
    }
    fs.readFile("./db.json","utf-8",(err,data)=>{
        let parsed = JSON.parse(data)
        parsed.users = parsed.users.map((el)=>{
          if(el.name==user){
            el.votes=el.votes+1
          }
          return el;
        })
        fs.writeFile("./db.json".JSON.stringify(parsed),"utf-8",()=>{
            return res.send("vote increased")
        })
    })
})
app.post("/db",(req,res)=>{
    fs.readFile("./db.json","utf-8",(err,data)=>{
       const parsed = JSON.parse(data)
       parsed.users = [...parsed.users,req.body]
       
       fs.writeFile("./db.json",JSON.stringify(parsed),"utf-8",()=>{
         return res.send("Data Added")
       })
    })
})
app.get("/db",(req,res)=>{
    fs.readFile("./db.json","utf-8",(err,data)=>{
        res.json(JSON.stringify(data))
    })
})

const PORT = process.env.PORT || 8080
app.listen(PORT,()=>{
    console.log("server : http://localhost:8080/")
})