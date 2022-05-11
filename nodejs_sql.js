//Open Call Express 
const express = require('express')
const bodyParser = require('body-parser')
 
const mysql = require('mysql')
 
const app = express()
const port = process.env.PORT || 5000;
 
app.use(bodyParser.json())
 
//--view--//
app.set('view engine','ejs')

//MySQL Connect phpMyAdmin
const pool = mysql.createPool({
    connectionLimit : 10,
    connectionTimeout : 20,
    host : 'localhost', //www.google.com/sql or Server IP Address
    user : 'root',
    password : '',
    database : 'nodejs_lottery' //Connect Database from beers.sql (Import to phpMyAdmin)
})
 
var obj ={}

app.get('/additem',(req, res) => {   
    res.render('additem')
})

//GET (เรียกข้อมูลขึ้นมาดู) | POST (ส่งข้อมูลหน้า Website กลับเข้ามา)
//GET All Beers (beers.sql)
app.get('',(req, res) => {
 
    pool.getConnection((err, connection) => {  //err คือ connect ไม่ได้ or connection คือ connect ได้ บรรทัดที่ 13-20
        if(err) throw err
        console.log("connected id : ?" ,connection.threadId) //ให้ print บอกว่า Connect ได้ไหม
        //console.log(`connected id : ${connection.threadId}`) //ต้องใช้ ` อยู่ตรงที่เปลี่ยนภาษา ใช้ได้ทั้ง 2 แบบ
         
        connection.query('SELECT * FROM lottery', (err, rows) => { 
            connection.release();
            if(!err){ //ถ้าไม่ error จะใส่ในตัวแปร rows
                //console.log(rows)
                //res.json(rows)
                //res.send(rows)
                obj ={lottery :rows,Error :err}
                res.render('index',obj)
            } else {
                console.log(err)
            }
         }) 
    })
})
 
//Copy บรรทัดที่ 24 - 42 มาปรับแก้ Code ใหม่
//สร้างหน้าย่อย ดึงข้อมูลเฉพาะ id ที่ต้องการ คือ 123, 124, 125
app.get('/:number',(req, res) => {
 
    pool.getConnection((err, connection) => {  //err คือ connect ไม่ได้ or connection คือ connect ได้ บรรทัดที่ 13-20
        if(err) throw err
        console.log("connected id : ?" ,connection.threadId) //ให้ print บอกว่า Connect ได้ไหม
        //console.log(`connected id : ${connection.threadId}`) //ต้องใช้ ` อยู่ตรงที่เปลี่ยนภาษา ใช้ได้ทั้ง 2 แบบ
 
        connection.query('SELECT * FROM lottery WHERE `number` = ?', req.params.number, (err, rows) => { 
            connection.release();
            if(!err){ //ถ้าไม่ error จะใส่ในตัวแปร rows
                obj ={lottery:rows,Error,err}
                res.render('showbynumber', obj)
                //res.send(rows)
            } else {
                console.log(err)
            }
         }) 
    })
})

app.get('/getday_month/:day&:month',(req, res) => {
 
    pool.getConnection((err, connection) =>{ //err คือ connect ไม่ได้ or connection คือ connect ได้บรรทัดที่ 13-19
        if(err) throw err
        console.log("connected id : ?", connection.threadId) //ให้ print บอกว่า Connect ได้ไหม
        //console.log(`connected id : ${connection.threadId}`)  //ต้องใช้ ` อยู่ตรงที่เปลี่ยนภาษา
 
        //แก้ไขคำสั่ง SQL
        connection.query('SELECT * FROM lottery WHERE `day` = ? OR `month` = ?', [req.params.day, req.params.month], (err, rows) => {
            connection.release();
            if(!err){ //ถ้าไม่ error จะแสดงค่าของตัวแปร rows
                //console.log(rows)
                // res.json(rows)
                console.log('SELECT * from lottery WHERE `day` = ? or `month` = ?', [req.params.day, req.params.month])
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})



app.use(bodyParser.urlencoded({extended: false})) 
//สร้าง Path ของเว็บไซต์ additem
app.post('/additem',(req, res) => {
    pool.getConnection((err, connection) => { //pool.getConnection สำหรับใช้เชื่อมต่อกับ Database 
        if(err) throw err
            const params = req.body
            //Check 
            pool.getConnection((err, connection2) => {
                connection2.query(`SELECT COUNT(number) AS count FROM lottery WHERE number = ${params.number}`, (err, rows) => {
                    if(!rows[0].count){
                connection.query('INSERT INTO lottery SET ?', params, (err, rows) => {
                    connection.release()
                    if(!err){
                        //res.send(`${params.name} is complete adding item. `)
                        obj = {Error:err, mesg : `Success adding data ${params.number}`}                                   
                        res.render('additem', obj)
                    }else {
                        console.log(err)

                        }
                    })           
            } else {
                //res.send(`${params.name} do not insert data`)
                obj = {Error:err, mesg : `Can not adding data ${params.number}`}                           
                res.render('additem', obj)     }
                    }) 
                              
                })
            })
        })


 app.delete('/delete/:number',(req, res) => {
                pool.getConnection((err, connection) =>{
                    if(err) throw err
                    console.log("connected id : ?", connection.threadId)
                    //ลบข้อมูลโดยใช้ id
                    connection.query('DELETE FROM `lottery` WHERE `lottery`.`number` = ?', [req.params.number], (err, rows) => {
                        connection.release();
                        if(!err){ 
                            res.send(`${[req.params.number]} is complete delete item. `) 
                        } else {
                            console.log(err)
                        }
                    })
                })
 })

app.listen(port, () => 
    console.log("listen on port : ?", port)
    )