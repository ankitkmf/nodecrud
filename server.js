const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const Axios  = require('axios')

var db

// Connect to Mongo Cloud
MongoClient.connect('mongodb://ankit:a123456@ds235302.mlab.com:35302/testapp', (err, database) => {
    if (err) return console.log(err)
    db = database.db('testapp')
    app.listen(process.env.PORT || 3100, () => {
        console.log('listening on 3100')
    })
})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// View User
app.get('/', (req, res) => {
    db.collection('userlist').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('index.ejs', { userlist: result })
    })
})

// Add User
app.post('/add', (req, res) => {
    db.collection('userlist').save(req.body, (err, result) => {
        if (err) return console.log(err)
        console.log('saved user to database')
        res.redirect('/')
    })
})

// Delete User
app.delete('/deleteuser', (req, res) => {
    db.collection('userlist').findOneAndDelete({ name: req.body.name }, (err, result) => {
        if (err) return res.send(500, err)
        res.send(req.body.name + ' is deleted from database')
    })
})

// View Wheather
app.post('/api/viewwheather', (req, res) => {
     res.header("Access-Control-Allow-Origin",  "*");
     res.header("Access-Control-Allow-Credentials", "true");    
    if (!req.body.username) {
        return res.status(200).send({
            success: 'false',
            message: 'User name is required'
        });
    } else if (!req.body.cityname) {
        return res.status(200).send({
            success: 'false',
            message: 'City Name is required'
        });
    }  
    db.collection('userlist').findOne({ name: req.body.username }, (err, result) => {
        if (err) {
            return res.status(500).send({
                success: 'false',
                message: 'Invalid User',
            })
        } else if (result) {
            if (result.role.toUpperCase() == "MANAGER") {
                let reqUrl = `http://api.openweathermap.org/data/2.5/weather?q=${req.body.cityname}&units=imperial&appid=c75f8cd1bb5a606189a1328e272d3cec`;

                Axios.get(reqUrl)
                    .then(response  =>  { 
                        response = response.data;
                        return res.status(200).send({
                            success: 'true',
                            message: response,
                        })
                    })
                    .catch(error  =>  {
                        return res.status(200).send({
                            success: 'false',
                            message: 'Api Error',
                        })
                    });
            } else {
                return res.status(200).send({
                    success: 'false',
                    message: 'Invalid User Role',
                })
            }
        }
    })
})