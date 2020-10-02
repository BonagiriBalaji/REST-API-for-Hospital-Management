var express= require('express');
var app=express();

//connection server file to JWT
let server=require('./server');
let middleware=require('./middleware');

//Bodyparser
const bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());


// DataBase Connection !!!
const MongoClient=require('mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017';
const dbName='hospital1';
let db
MongoClient.connect(url,{ useUnifiedTopology: true }, (err,client)=>{

    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});

// READ HOSPITAL DETAILS & VENTILATORS DETAILS :
 
app.get('/hospitaldetails',middleware.checkToken,function (req, res) { 
      console.log("Fetching data from Hospital collection"); 
       var data = db.collection('Hospital').find().toArray()
       .then(result => res.json(result));
 });
 
app.get('/ventilatordetails',middleware.checkToken, function (req, res) { 
      console.log("ventilators Details !"); 
       var data = db.collection('ventilator').find().toArray()
       .then(result => res.json(result));
 });
 


 //SEARCH VENTILATORS BY STATUS and HOSPITAL NAME

 app.post('/searchVentbystatusAndhospitalname',middleware.checkToken,(req, res) => {
      var status = req.query.status; 
      var name=req.query.name;
      console.log(status+" and "+name);
      var ventilatordetails = db.collection('ventilator').find({ "status": status,"name": new RegExp(name, 'i') }).toArray()
      .then(result => res.json(result));
});

//SEARCH HOSPITAL BY NAME

app.post('/searchhospital',middleware.checkToken,(req, res) => {
      var name = req.query.name;
      console.log(name);
      var hospitaldetails= db.collection('Hospital')
      .find({ 'name': new RegExp(name,'i') }).toArray()
      .then(result => res.json(result));
 });


 //UPDATE VENTILATOR DETAILS

app.put('/updateventilator',middleware.checkToken,  (req, res) => {
      var ventid = { ventilatorid : req.body.ventilatorid };
      console.log(ventid);
      var newvalues = { $set: { status: req.body.status } };
      db.collection("ventilator").updateOne(ventid, newvalues, function (err, result){res.json('1 document updated');
      if (err) throw err;
      console.log("1 document updated");
});
});

//ADD Ventilator

app.put('/addventilatorbyuser',middleware.checkToken, (req, res) => {
      var hId= req.body.hid;
      var VentilatorId=req.body.ventilatorid;
      var Status=req.body.status;
      var Name=req.body.name;
      var item={ hid:hId, ventilatorid:VentilatorId, status:Status, name:Name}; 
      
      db.collection('ventilator').insertOne(item, function (err, result) { res.json('Item inserted')});
      console.log("ventilator inserted");
});

//DELETE VENTILATOR BY VentilatorID

app.delete('/delete',middleware.checkToken,(req,res)=>{
      var myquery=req.query.ventilatorid;
      console.log(myquery);
      var myquery1={ventilatorid : myquery};
      db.collection('ventilator').deleteOne(myquery1,function(err,obj){
          if (err) throw err;
          res.json('1 document deleted');
      });
      console.log("1 ventilator deleted");
  });

app.listen(1000);