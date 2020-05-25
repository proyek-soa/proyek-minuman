const express = require("express");
const mysql = require("mysql");
const app = express();
const jwt = require("jsonwebtoken");
const request = require("request");
const multer=require('multer');
const path=require('path');
const pool = mysql.createPool({
    host:"localhost",
    database:"proyek_soa",
    user:"root",
    password:""
})
const storage=multer.diskStorage({
    destination:'./public/uploads',
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
    }
});
const upload=multer({
    storage:storage,
    fileFilter: function(req,file,cb){
        checkFileType(file,cb);
    }
}).single('myImage');

function checkFileType(file,cb){
    const filetypes= /jpeg|jpg|png|gif/;
    const extname=filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype=filetypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null,true);
    }else{
        cb('Error: Image Only!');
    }

}
function getminuman(title) {
    return new Promise(function(resolve, reject) {
        var options = {
            'method': 'GET',
            'url': `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${title}`
          };
        request(options, function (error, response) { 
        if (error) reject(error);
        resolve(response.body);
        });
    });
}
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.post('/api/register',(req,res)=>{
    var temp=req.body.username;

    if(!req.body.username||!req.body.password){
        res.status(400).send("Bad Request : 400");
    }
    else if(!req.body.username||!req.body.password){
        res.status(400).send("Status :400, Pastikan Parameter terisi");
    }
    else{
        var query="select * from user where username='"+req.body.username+"'";
        pool.query(query,(err,rows,fields)=>{
            if(err)console.log(err);
            else{
                if(rows.length==1){
                    res.status(400).send("status: 400, Pendaftaran gagal,username sudah terdaftar");
                }else{
                    var querys= "insert into user values('','"+temp+"','"+req.body.password+"',0)"
        
                    pool.query(querys,(err,rows,fields)=>{
                        if(err)console.log(err);
                        else{
                            res.status(200).send("status: 200, Pendaftaran Berhasil");
                        }
                        
                    });
                }
            }})

        
    }    
});
app.post("/api/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    pool.getConnection(function(err,conn){
        if(err) res.status(500).send(err);
        else{
            conn.query(`select * from user where username='${username}' and password ='${password}'`,function(error,result){
                if(error ) res.status(500).send(error);
                else{
                    
                    if(result.length <=0){
                        return res.status(400).send("Invalid username or password");
                    }
                    console.log(result[0].id_user)
                    const token = jwt.sign({    
                        "id":result[0].id_user,
                        "membership":result[0].status,
                    }   ,"minuman");
                    console.log(token.id)
                    res.status(200).send(token);
                }
            })
        }
    });
});
app.get("/api/searchminuman/:namaminuman/:username",async function(req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
    var namaminuman=req.params.namaminuman;
    if(!token){
        ctr=0;
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"minuman");
    }catch(err){
        ctr=0;
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        ctr=0;
        return res.status(400).send("Token expired");
    }
    if (ctr==1) {
 
       
        var query= "insert into history_search values('"+req.params.username+"','"+req.params.namaminuman+"')"
        
        pool.query(query,(err,rows,fields)=>{
            if(err)console.log(err);
            else{
               
            }
            
        });
        
        var hasil = await getminuman(req.params.namaminuman);
        const parsing=JSON.parse(hasil);
        res.status(200).send(parsing)
       

}
    
});
app.get("/api/viewsearchhistory/:username",async function(req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
    var namaminuman=req.params.namaminuman;
    if(!token){
        ctr=0;
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"minuman");
        console.log(user.id)
    }catch(err){
        ctr=0;
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        ctr=0;
        return res.status(400).send("Token expired");
    }
    if (ctr==1) {
 
       
        pool.getConnection(function(err,conn){
            if(err) res.status(500).send(err);
            else{
                conn.query(`select search from history_search where username='${req.params.username}'`,function(error,result){
                    if(error ) res.status(500).send(error);
                    else{
                        res.send(result)
                    }
                })
        }})
        

}
    
});
app.get("/api/top10search",async function(req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
    var namaminuman=req.params.namaminuman;
    if(!token){
        ctr=0;
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"minuman");
        console.log(user.id)
    }catch(err){
        ctr=0;
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        ctr=0;
        return res.status(400).send("Token expired");
    }
    if (ctr==1) {
 
       
        pool.getConnection(function(err,conn){
            if(err) res.status(500).send(err);
            else{
                conn.query(`select total,search from (select count(*)as "TOTAL",search as "SEARCH" from history_search order by 1 desc) AS HISTORYS limit 0,9)`,function(error,result){
                    if(error ) res.status(500).send(error);
                    else{
                        res.send(result)
                    }
                })
        }})
        

}
    
});
app.post('/api/upload',function (req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
    var namaminuman=req.params.namaminuman;
    if(!token){
        ctr=0;
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"minuman");
        console.log(user.id)
    }catch(err){
        ctr=0;
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        ctr=0;
        return res.status(400).send("Token expired");
    }
    if (ctr==1) {
    upload(req,res,(err)=>{
        if(err){
            console.log(err);
            res.send(err);
        }else{
            req.file.filename=user.username+".png";
            console.log(req.file.filename);
            res.send('Upload Berhasil');
        }
    });
}
});

app.listen(3000);
//tests
console.log("listening to hosts 3000");