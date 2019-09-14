const BASE_URL = 'https://202.31.200.146:8000/';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var async = require("async");
var multipart = require('connect-multiparty');
var multipartMiddleWare = multipart();
var https = require('https');
const fs = require('fs');
var options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt'),
    ca: fs.readFileSync('server.csr')
};
var server = https.createServer(options, app);
var io = require('socket.io')(server);
//-----------------------------------------------------------
var users = [];
var rooms = [];
var roomId = 1;


var port2 = 8000;


//-----------------------------------------------------------
const mongoose = require('mongoose');
const db = mongoose.connection;
const dbaddr = "mongodb://127.0.0.1:27017/weatherProject"; //우선 test는 실험용
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', function () {
    console.log('Connected!');
});
mongoose.connect(dbaddr);

const userschema = new mongoose.Schema({
    userid: { type: String, required: true, trim: true }, //userid == email
    name: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true },
});

const chatschema = new mongoose.Schema({
    roomid: { type: String, require: true, trim: true },
    users: [String],
    record: [{
        time: String,
        writer: String,
        message: String
    }]
});

const goodschema = new mongoose.Schema({
    name: { type: String },
    user_email: { type: String },
    price: { type: String },
    realLocation: { type: String },
    location: {
        lat: String,
        long: String
    },
    weather: { type: String },
    goods_category: { type: String },
    category: { type: String },
    description: { type: String },
    imagePath: {
        first: String,
        second: String
    },
    rentPeriod: { type: String }
});

var userModel = mongoose.model("users", userschema, 'users');
var chatModel = mongoose.model("chats", chatschema, 'chats');
var goodsModel = mongoose.model("goods", goodschema, 'goods');
//-----------------------------------------------------------
app.set('views', __dirname);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
    resave: false,
    saveUninitialized: true
}));
app.use('/', express.static(__dirname));


app.get('/', function (req, res) {
    res.render('index', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/index', function (req, res) {
    res.render('index', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/rental01', function (req, res) {
    res.render('doc/rental01', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/rental01_02', function (req, res) {
    res.render('doc/rental01_02', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/rental01_03', function (req, res) {
    res.render('doc/rental01_03', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/rental_recommendation', function (req, res) {
    res.render('doc/rental_recommendation', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/rental01-2', function (req, res) {
    if (isLogin(req, res)) {
        res.render('doc/rental01-2', {
            gid: req.query.gid,
            userid: req.session.userid,
            name: req.session.name
        });
    } else {
        res.send("<script>alert('login first');location.href='/';</script>");
    }
});
app.get('/doc/rental02', function (req, res) {
    res.render('doc/rental02', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/rentalView', function (req, res) {
    res.render('doc/rentalView', {
        gid: req.query.gid,
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/payment', function (req, res) {
    res.render('doc/payment', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/chat', function (req, res) {
    console.log(">>>>>>chatpage for ", req.query.hisname, req.session.userid);
    res.render('doc/chat', {
        roomid: req.query.roomid,
        othersname: req.query.hisname,
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/faq', function (req, res) {
    res.render('doc/faq', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/faq_contents', function (req, res) {
    res.render('doc/faq_contents', {
        userid: req.session.userid,
        name: req.session.name,
        f_id: req.query.f_id
    });
});
app.get('/doc/chatlist', function (req, res) {
    res.render('doc/chatlist', {
        rooms: rooms,
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/login', function (req, res) {
    res.render('doc/login', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/loginCB', function (req, res) {
    res.render('doc/loginCB', {
        userid: req.session.userid,
        name: req.session.name
    });
});
app.get('/doc/registerlist', function (req, res) {
    res.render('doc/registerlist', {
        userid: req.session.userid,
        name: req.session.name
    });
});

//---------------------------------------------------------------\

updateRooms();

/*세션에서 로그인 된 유저가 있는지 체크*/
function isLogin(req, res) {
    if (req.session.userid != null && req.session.userid != "")
        return true;
    else
        return false;
}
app.get('/API/logout', function (req, res) {
    if (isLogin(req, res) == false) return;

    req.session.destroy(function (err) {
        if (err) res.status(400).send(err);
        res.send("logout");
        // 세션 쿠키 삭제
    });
});

app.get('/API/login', function (req, res) {
    var Data = {
        userid: req.query.userid,
        name: req.query.name,
        gender: req.query.gender
    }

    userModel.findOne({ uid: Data.userid }, function (err, userData) {
        if (err) return res.status(500).json({ error: err });
        if (userData) { //회원가입 되어있음..
            req.session.userid = userData.userid;
            req.session.logined = true;
            req.session.name = userData.name;
            req.session.gender = userData.gender;
            res.json(userData.userid);
        } else {
            var userObject = new userModel({
                userid: Data.userid,
                name: Data.name,
                gender: Data.gender
            })
            userObject.save(function (err, userObject) {
                if (err)
                    return res.status(500).json({ error: err })
                else {
                    req.session.userid = Data.userid;
                    req.session.logined = true;
                    req.session.name = Data.name;
                    req.session.gender = Data.gender;
                    res.json(Data.userid);
                }
            });
        }
    });
});

app.get('/API/roomlist', function (req, res) {
    res.send(rooms)
});

app.get('/API/chatrecord', function (req, res) {
    if (isLogin(req, res)) {
        chatModel.findOne({ roomid: req.query.roomid }, function (err, chat) {
            if (err) res.status(500).json({ error: err });
            res.send(chat);
        });
    } else {
        res.send("alert('login first')");
    }

});

app.get('/API/goods', function (req, res) {
    goodsModel.find(function (err, goods) {
        res.send(goods);
    });
});

app.get('/API/getProduct', function (req, res) {
    console.log(req.query.gid);
    goodsModel.findOne({ _id: req.query.gid }, function (err, goods) {
        res.send(goods);
    });
});
app.get('/API/weather_goods', function (req, res) {
    console.log(req.query.data);
    goodsModel.find({ weather: req.query.data }, function (err, goods) {
        console.log(goods);
        res.send(goods);
    });
});
app.get('/API/category_goods', function (req, res) {
    console.log(req.query.data);
    goodsModel.find({ category: req.query.data }, function (err, goods) {
        console.log(goods);
        res.send(goods);
    });
});

app.get('/API/DeleteProduct', function (req, res) {
    console.log(req.query.gid);
    goodsModel.deleteOne({ _id: req.query.gid }, function (err, goods) {
        res.send("success");
    });
});

app.get('/API/productById', function (req, res) {
    console.log(req.query.data);
    goodsModel.findOne({ _id: req.query.data }, function (err, goods) {
        console.log(goods);
        res.send(goods);
    });
});

app.get('/API/type_goods', function (req, res) {
    console.log(req.query.data);
    goodsModel.find({ goods_category: req.query.data }, function (err, goods) {
        console.log(goods);
        res.send(goods);
    });
});
app.get('/API/myproducts', function (req, res) {
    console.log("~~~");
    goodsModel.find({ user_email: req.session.userid }, function (err, goods) {
        console.log(goods);
        res.send(goods);
    });
});

function getLocalTimeString() {
    var now = new Date();
    return now.toLocaleString();
}

function isExistRoom(data) {
    return rooms.findIndex(room => { return (room.users.indexOf(data.sendto) != -1) && (room.users.indexOf(data.sendfrom) != -1) });
}

function updateRooms() {
    chatModel.find(function (err, chats) {
        if (!err) {
            for (var i = 0; i < chats.length; i++) {
                var room = {
                    roomid: chats[i].roomid,
                    users: chats[i].users
                }
                rooms.push(room);
                roomId++;
            }
        }
    });
}

function findUsersById(roomid) {
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].roomid == roomid)
            return rooms[i].users;
    }
}

function updateChatRecord(recordData, roomid) {
    chatModel.findOne({ roomid: roomid }, function (err, chat) {
        if (err) return err;
        if (!chat) {
            var users = findUsersById(roomid);
            var chatObject = new chatModel({
                roomid: roomid,
                users: users,
                record: recordData
            });
            chatObject.save(function (err, chatObject) { if (err) return err; })

        } else {
            chatModel.update({ roomid: roomid }, { $push: { "record": recordData } }, { safe: true, upset: true, new: true },
                function (err, model) {
                    if (err) console.log(err);
                    else console.log("된다...", model);
                });
        }
    })

}

io.on('connection', function (socket) {
    console.log('__a user connected : ', socket.id);
    socket.emit('connection', {
        type: 'connected'
    });

    socket.on('login', function (data) {
        io.to(data.socketid).emit('login', data.userid);
        users[data.userid] = data.socketid;
        console.log(data.userid, data.socketid);
    });

    socket.on('update', function (data) {
        users[data.sendfrom] = data.mysocketid;
        var index;
        if ((index = isExistRoom(data)) >= 0) {
            socket.join(rooms[index].roomid);
            // io.sockets.in(rooms[index].roomid).emit('join',{sendfrom: data.sendfrom,roomid:rooms[index].roomid ,msg:"join ok"});
            //console.log("모든 정보",socket.adapter.rooms[rooms[index].roomid],users);
        }
    });

    socket.on('join', function (data) {
        users[data.sendfrom] = data.mysocketid;
        socket.user = data.sendfrom;
        var index;

        if ((index = isExistRoom(data)) < 0) { //room 만들기
            console.log("room만들기");
            var rId = 'r' + roomId;
            var room = {
                roomid: rId,
                users: [data.sendfrom, data.sendto]
            }
            rooms.push(room);
            console.log("모든 룸 보여줘" + rooms);
            socket.join(rId);
            // io.sockets.in(rId).emit('join',{sendfrom: data.sendfrom, msg:"join ok", roomid:rId});
            io.to(data.mysocketid).emit('join', { sendto: data.sendto, sendfrom: data.sendfrom, msg: "join ok", roomid: rId });
            console.log("이 룸에 연결된 소켓 id들", socket.adapter.rooms[rId]);
            roomId++;
        } else { //room이 이미 만들어져있어!
            socket.join(rooms[index].roomid);
            io.to(data.mysocketid).emit('join', { sendto: data.sendto, sendfrom: data.sendfrom, msg: "join ok", roomid: rooms[index].roomid })
            //console.log("모든 정보",socket.adapter.rooms[rooms[index].roomid],users);
        }
    });

    socket.on('disconnect', function () {
        console.log('__user disconnected : ', socket.id, socket.user);
        //socket.leave(room[id])
    });

    socket.on('send message', function (data) {
        console.log(data.sendfrom + '_message : ' + data.msg);
        var currentTime = getLocalTimeString();
        var recordData = {
            time: currentTime,
            writer: data.sendfrom,
            message: data.msg
        };
        updateChatRecord(recordData, data.roomid);
        socket.broadcast.to(data.roomid).emit('receive message', { sendfrom: data.sendfrom, time: currentTime, msg: data.msg });
    });



});

app.post('/API/rentalEnroll', multipartMiddleWare, function (data, res) {
    if (!data)
        console.log("There is not data!");
    var data_location = data.body.location.split(':');
    var imageLength = data.files.image.length;
    var imageArray = [];
    var imagePath = [];
    console.log(imageLength + "Sdfs");
    
    if (imageLength == 2) {
        for (var i = 0; i < imageLength; i++) {
            if (data.files.image[i]) {
                var image = data.files.image[i];
                var imageName = image.name;
                imagePath[i] = image.path;
                var imageType = image.type;
                if (imageType.indexOf('image') != -1) {
                    imageArray[i] = "./public/image/" + imageName;
                } //end of 이미지 파일 확인
                else {
                    fs.unlink(imagePath, function (err) { });
                    res.send("failed");
                }
                fs.rename(imagePath[i], imageArray[i], function (err) { }) //end of fs.rename
            }
        }
        var goodsInfo = new goodsModel({
            name: data.body.name,
            user_email: data.body.userid,
            price: data.body.price,
            realLocation: data.body.realLocation,
            location: {
                lat: data_location[0],
                long: data_location[1]
            },
            weather: data.body.weatherCa,
            goods_category: data.body.goodsCa,
            category: data.body.category,
            description: data.body.description,
            imagePath: {
                first: imageArray[0],
                second: imageArray[1]
            },
            rentPeriod: data.body.period
        });
        goodsInfo.save(function (err, goodsInfo) {
            if (err) return console.error(err);
            console.dir(goodsInfo);
            res.redirect(BASE_URL);
        }) // end of goodsInfo.save

    } 
    else {
        //res.send("<script>alert('파일 두 개 이하 넣으세요.');location.href='/doc/rental02';</script>");
        if (data.files.image) { //파일을 받음 
            var image = data.files.image;
            var imageName = image.name;
            var imagePath = image.path;
            var imageType = image.type;
            if (imageType.indexOf('image') != -1) { //이미지 파일이면,
                var outputPath = "./public/image/" + imageName;
                var sec_outputPath = "./public/image/white.jpg"; 
                fs.rename(imagePath, outputPath, function (err) { //outputPath에 저장
                    var goodsInfo = new goodsModel({
                        name: data.body.name,
                        user_email: data.body.userid,
                        price: data.body.price,
                        realLocation: data.body.realLocation,
                        location: {
                            lat: data_location[0],
                            long: data_location[1]
                        },
                        weather: data.body.weatherCa,
                        goods_category: data.body.goodsCa,
                        category: data.body.category,
                        description: data.body.description,
                        imagePath: {
                            first: outputPath,
                            second: sec_outputPath
                        },
                        rentPeriod: data.body.period
                    });
                    goodsInfo.save(function (err, goodsInfo) {
                        if (err) return console.error(err);
                        console.dir(goodsInfo);
                        res.redirect(BASE_URL);
                    }) // end of goodsInfo.save
                }); //end of fs.rename(imagePath,outputPath,function(err)
            }
        }
    }

    console.log(imageArray);
    console.log(imageArray[0]);
})

server.listen(port2, function () {
    console.log("Https server listening on port " + port2);
});