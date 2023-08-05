
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.json())
const cookieParser = require('cookie-parser')
app.use(cookieParser('1234'))

const cors = require('cors');
app.use(cors());

const jwt = require('jsonwebtoken');

//FIREBASE_____________________________________________________
const firebase = require('firebase');
const firebaseConfig = {
    apiKey: "AIzaSyCQ-nIBIQamtIiDuVPy-Yurzp2IAOpDpRc",
    authDomain: "mary-s-database-c1ca4.firebaseapp.com",
    databaseURL: "https://mary-s-database-c1ca4-default-rtdb.firebaseio.com",
    projectId: "mary-s-database-c1ca4",
    storageBucket: "mary-s-database-c1ca4.appspot.com",
    messagingSenderId: "560536661583",
    appId: "1:560536661583:web:01a11a7f31c367f621443a"
};

firebase.initializeApp(firebaseConfig);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))


//CROSS ORIGIN___________________________________
app.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//GET ACCEPTED APPOINTMENT________________________________________
app.post('/get_appointment', security, async (req, res) => {

    let arr_date = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
    let date = new Date();

    var arr = [];

    var data = await firebase.database().ref('appointment').orderByChild('accepted').equalTo('true').once('value');
    
    let count_data = 0;
    let condition = false;
    let condition_have = false;
    for await(let month of arr_date){
        if(month === arr_date[date.getMonth()]){
            condition = true;
        }else{
            if(!condition) arr.push([]);
        }

        if(condition){     
            let arr_tempo = [];

            await data.forEach((childSnapshot) =>{
                var item = childSnapshot.val();
                item.key = childSnapshot.key;        

                let month_manifest = item.date.split(' ');

                if(month === month_manifest[0]){
                    count_data += 1;
                    arr_tempo.push(item);
                }
            });

            if(arr_tempo.length > 0){
                condition_have = true;
                arr.push(arr_tempo);
            }else{
                arr.push([]);
            }
        }
    }

    if(condition_have){  
        res.json({ response: 'success', data: arr, count: count_data  });
    }else{
        res.json({ response: 'no-data' });
    }   

});

app.post ('/login', (req, res) => {
    const { username, password } = req.body;
    var token = jwt.sign(process.env.TOKEN_FOR, process.env.ACCESS_TOKEN_SECRET);

    if(username === 'admin' && password === 'admin'){
		res.json({ response: 'success', token: token })
	}else{
            console.log('no-record')
            res.json({ response: 'no-record' })
        }
    
});


app.post('/checkingToken', security, (req, res) => {
    res.json({ response: 'success' });
});

function security(req, res, next){
    const { auth } = req.body; 
    if(typeof auth !== 'undefined'){
        const token = auth;
        if(token !== ''){
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
                if(err) {
                    res.json({ response: 'nope' });
                }else{
                    next();
                }
            });
        }else{
            res.json({ response: 'nope' });
        }
    }else{
        res.json({ response: 'nope' });
    }
}

app.get('/', (req, res) => {
    res.json({ asd: 'asd' });
})

app.post('/catch_data', (req, res) => {
    const { full_name, email, message } = req.body.data;
    res.json({ full_name: full_name, email: email, message: message });
});

app.listen(( process.env.PORT || 4202 ));




