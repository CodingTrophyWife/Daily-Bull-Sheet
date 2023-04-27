const express = require('express');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;

// asks express to create a route for every file in the "public folder and give it a '/' route
app.use(express.static('public'));
// sets up express app to handle data parser, middle wear created req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// GET route for Static homepage
app.get('/', (req, res) =>{
  res.sendFile(path.join(__dirname,'/public/index.html'));
}) 

// GET /notes should return the notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// GET route to read the db.json file and return all saved notes as json
app.get('/api/notes', (req, res) => {
  fs.readFile("./db/db.json", "utf-8",(err,data)=>{
    if(err){
       return res.status(500).json({msg:"error reading db"})
    } else {
       const dataArr = JSON.parse(data);
       return res.json(dataArr);
    }
  })
})


//receive a new note to save on the request body, add it to the `db.json` file, and then return the new note
app.post('/api/notes', (req,res)=>{
  fs.readFile("./db/db.json", "utf-8", (err,data) => {
    if(err) {
      return res.status(500).json({msg:"error reading db"});
    } else {
      var dbData = JSON.parse(data);
      const newNote = {
        id: uuid.v4(),
        title: req.body.title,
        text: req.body.text
      };
      dbData.push(newNote);
      fs.writeFile("./db/db.json",JSON.stringify(dbData,null,4),(err)=>{
        if(err) {
          return res.status(500).json({msg:"error writing db"});
        } else {
          return res.json(newNote);
        }
      });
    }
  });
})
// this lets you delete a note
app.delete('/api/notes/:id', (req,res) => {
  fs.readFile("./db/db.json", "utf-8", (err,data) => {
    if (err) {
      return res.status(500).json({msg:"error reading db.json"});
    } else {
      var dbData = JSON.parse(data);
      var id = req.params.id;
      for (let i = 0; i < dbData.length; i++) {
        if(dbData[i].id==id){
            id = i;
        }   
      }
      const newData = dbData.slice(0, id).concat(dbData.slice(id + 1, dbData.length));
      fs.writeFile("./db/db.json",JSON.stringify(newData,null,4),(err)=>{
        if(err) {
          return res.status(500).json({msg:"error writing db"});
        } else {
          return res.json({msg:"note deleted"});
        }
      }); 
    }
  });
})

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
