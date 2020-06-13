const express = require("express");
const mysql = require("mysql");
const app = express();
const jwt = require("jsonwebtoken");
const request = require("request");
const multer=require('multer');
const path=require('path');

const pool = mysql.createPool({
    host:"us-cdbr-east-05.cleardb.net",
    database:"heroku_b899db830aa2670",
    user:"bbb583fa10a49d",
    password:"57d149b46f3135e"
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
}).single('image');

function checkFileType(file,cb){
    const filetypes= /jpeg|jpg|png|gif/;
    const extname=filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype=filetypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null,true);
    }else{
        return cb('Error: Image Only!');
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
function getminumanid(id) {
    return new Promise(function(resolve, reject) {
        var options = {
            'method': 'GET',
            'url': `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`
          };
        request(options, function (error, response) { 
        if (error) reject(error);
        resolve(JSON.parse(response.body));
        });
    });
}
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get('/', (req, res) => res.send('Halo'));

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
                    var querys= "insert into user values('','"+temp+"','"+req.body.password+"',0,0)"
        
                    pool.query(querys,(err,rows,fields)=>{
                        if(err)console.log(err);
                        else{
                            res.status(200).send("status: 200, Pendaftaran Berhasil");
                        }
                    });
                }
            }
        })
    }    
});

app.post("/api/login",function(req,res){
    if(!req.body.username||!req.body.password){
        res.status(400).send("Bad Request : 400");
    }
    else{
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
    }
});

app.get("/api/searchminuman/:namaminuman/:username",async function(req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
    if(!req.params.namaminuman||!req.params.username){
        res.status(400).send("Bad Request : 400");
    }
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
    if(!req.params.username){
        res.status(400).send("Bad Request : 400");
    }
    else{
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
                        if(error) res.status(500).send(error);
                        else{
                            res.send(result)
                        }
                    })
                }
            })
        }
    }h
});

app.get("/api/top10search",async function(req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
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
                conn.query(`select total,search from (select count(*) as "TOTAL",search as "SEARCH" from history_search order by 1 desc) AS HISTORYS limit 0,9`,function(error,result){
                    if(error) res.status(500).send(error);
                    else{
                        res.send(result)
                    }
                })
            }
        })
    }
});


app.post('/api/upload',function (req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
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
                try{
                    req.file.filename=user.username+".png";
                    console.log(req.file.filename);
                    res.send('Upload Berhasil');
                }catch(err){
                    res.send("Status 400: Bad Request")
                }
                
            }
        });
    }
});

app.post("/api/topup",function(req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
    if(!req.body.saldo){
        res.status(400).send("Bad Request : 400");
    }
    else{
        var saldo=req.body.saldo;
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

        if(saldo==0){
            res.status(400).send("Tidak bisa topup 0");
        }
        pool.getConnection(function(err,conn){
            if(err) res.status(500).send(err);
            else{
                conn.query(`select * from user where id_user='${user.id}'`,function(error,result){
                    if(error ) res.status(500).send(error);
                    else{
                        if(result.length<1){
                            return res.status(400).send("Salah id");
                        }
                        var saldo2 = result[0].wallet;
                        var saldo1=(saldo-0)+(saldo2-0);
                        let queryinsert = "update user set wallet="+saldo1+" where id_user='"+user.id+"'";
                        conn.query(queryinsert, (err, result) => {
                            if (err) throw err;
                        });
                        let token={
                            "username":result[0].username,
                            "saldo":saldo1
                        }
                        res.status(200).send(token);
                    }
                })
            }
        });
    }
});

app.post("/api/get_premium",function(req,res){
    var ctr=1;
    var harga=5000;
    const token = req.header("x-auth-token");
    let user = {};
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

    pool.getConnection(function(err,conn){
        if(err) res.status(500).send(err);
        else{
            conn.query(`select * from user where id_user='${user.id}'`,function(error,result){
                if(error ) res.status(500).send(error);
                else{
                    if(result.length<1){
                        return res.status(400).send("Salah id");
                    }
                    else if(result[0].status==1){
                        return res.status(400).send("Anda sudah menjadi member premium");
                    }
                    else if(result[0].wallet<harga){
                        return res.status(400).send("Anda kekurangan uang untuk menjadi premium");
                    }
                    var saldo2 = result[0].wallet;
                    var saldo1 = saldo2-harga;
                    let queryinsert = "update user set wallet="+saldo1+", status="+1+" where id_user='"+user.id+"'";
                    conn.query(queryinsert, (err, result) => {
                        if (err) throw err;
                    });
                    let token={
                        "username":result[0].username,
                        "saldo":saldo1
                    }
                    res.status(200).send(token);
                }
            })
        }
    });
});

app.post("/api/add_drink", async function(req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
    console.log(req.body.drink_id)
    console.log(req.body.price)
    if(!req.body.drink_id||!req.body.price){
        console.log("test")
        res.status(400).send("Bad Request : 400");
    }
    else{
        var drink_id=req.body.drink_id
        var price=req.body.price;
        let hasil = await getminumanid(drink_id);
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
        if(user.membership!=2){
            return res.status(400).send("Tidak bisa add, anda bukan admin");
        }
        if(!hasil.drinks){
            return res.status(400).send("Salah id");
        }
        var hasil1 = hasil.drinks[0];
        pool.getConnection(function(err,conn){
            if(err) res.status(500).send(err);
            else{
                let queryinsert = "INSERT INTO `minuman`(`id_drink`, `drink_name`, `drink_category`, `drink_alcoholic`, `drink_glass`, `drink_price`, `ori_id`) VALUES (null, '"+hasil1.strDrink+"', '"+hasil1.strCategory+"', '"+hasil1.strAlcoholic+"', '"+hasil1.strGlass+"', "+price+", "+hasil1.idDrink+")";
                conn.query(queryinsert, (err, result) => {
                    if (err) throw err;
                });
                res.status(200).send(hasil1);
            }
        });
    }
});

app.post("/api/buy_drink", async function(req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
    if(!req.body.id_minuman){
        console.log("test")
        res.status(400).send("Status 400 : Bad Request")
    }
    else{

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
        // if(user.membership!=1){
        //     return res.status(400).send("Mungkin premium");
        // }
        var id=user.id;
        pool.getConnection(function(err,conn){
            if(err) res.status(500).send(err);
            else{
                conn.query(`select * from user where id_user='${user.id}'`,function(error,result){
                    if(error ) res.status(500).send(error);
                    else{
                        if(result.length<1){
                            return res.status(400).send("Salah id user");
                        }
                        var saldo2 = result[0].wallet;
                        conn.query(`select * from minuman where id_drink='${id}'`,function(error,result){
                            if(error) res.status(500).send(error);
                            else{
                                if(result.length<1){
                                    return res.status(400).send("Salah id minuman");
                                }
                                if(saldo2<result[0].drink_price){
                                    return res.status(400).send("Anda tidak mempunyai cukup uang");
                                }
                                var saldo1 = saldo2-result[0].drink_price;
                                let queryinsert = "update user set wallet="+saldo1+" where id_user='"+user.id+"'";
                                conn.query(queryinsert, (err, result) => {
                                    if (err) throw err;
                                });
                                queryinsert = "INSERT INTO `history_buy`(`id`, `id_user`, `id_drink`, `status`) VALUES (null, "+user.id+", "+id+", 0)";
                                conn.query(queryinsert, (err, result) => {
                                    if (err) throw err;
                                });
                                result.push({"userId":user.id,"wallet":saldo1})
                                res.status(200).send(result);
                            }
                        })
                    }
                })
            }
        });
    }
});

//belum jadi
app.get("/api/showrandom",async function(req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
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
                conn.query(`select * from minuman`,function(error,result){
                    if(error) res.status(500).send(error);
                    else{
                        let rand = Math.floor(Math.random() * result.length);
                        res.send(result[rand]);
                    }
                })
            }
        })
    }
});

app.get("/api/showlatest10",async function(req,res){ //ini diurutkan berdasarkan ID
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
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
                conn.query(`select * from minuman order by 7 desc limit 10`,function(error,result){
                    if(error) res.status(500).send(error);
                    else{
                        res.send(result);
                    }
                })
            }
        })
    }
});

app.get("/api/showall",async function(req,res){
    var ctr=1;
    const token = req.header("x-auth-token");
    let user = {};
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
                conn.query(`select * from minuman order by 7 desc`,function(error,result){
                    if(error) res.status(500).send(error);
                    else{
                        res.send(result);
                    }
                })
            }
        })
    }
});

app.put("/api/editprofile", async function(req,res){   
    if(!req.body.username||!req.body.password||!req.body.confirmpass){
        res.status(400).send("Bad Request : 400");
    }
    else{
        var ctr=1;
        const token = req.header("x-auth-token");
        let user = {};
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


        pool.getConnection(function(err,conn){
            if(err) res.status(500).send(err);
            else{
                conn.query(`select * from user where id_user='${user.id}'`,function(error,result){
                    if(error) res.status(500).send(error);
                    else{
                        if(result.length<1){
                            return res.status(400).send("Salah id user");
                        }
                        else if(req.body.password != req.body.confirmpass){
                            return res.status(400).send("Password salah");
                        }
                        let queryinsert = "update user set username='"+req.body.username+"', password='"+req.body.password+"' where id_user="+user.id+"";
                        conn.query(queryinsert, (err, result) => {
                            if (err) throw err;
                            else{
                                res.status(200).send("Status 200 : Berhasil")
                            }
                        });
                    }
                })
            }
        });
    }
});
