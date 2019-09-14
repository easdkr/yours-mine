var location_xy = "";


$(document).ready(function() {

    $(".link").append("<img src='/img/main/pre_tab_new.png'>")

    $(".menu_btn").click(function() {
        $("#gnbWrap").animate({ left: 0 })
        $("#headerWrap").append("<div class='menu-on'></div>")

        return false;
    })

    $(".close_btn").click(function() {
        $("#gnbWrap").animate({ left: -$("#gnbWrap").width() })
        $(".menu-on").remove()
    })

    $(".in_wrap_cont > div:not(:first)").hide()
    $(".in_wrap_tab li").click(function() {
        var in_tab_num = $(this).index()
        $(".in_wrap_cont div").hide()
        $(".in_wrap_cont div:eq(" + in_tab_num + ")").show()
        $(".in_wrap_tab li").removeClass()
        $(this).addClass("on")
    })

    // advertose
    $(".adver_tab li").click(function() {
        var adver_tab_num = $(this).index()
        $(this).parent("ul").next().children("p").hide()
        $(this).parent("ul").next().children("p:eq(" + adver_tab_num + ")").show()

        $(this).parent("ul").children().removeClass("on")
        $(this).addClass("on")
    })

    // gnb del2
    $(".del2 > a").toggle(function() {
        $(this).not("animated").parent().children("ul").slideDown()
        $(this).not("animated").css({ backgroundImage: "url(/img/common/del2_close.png)" })

        return false;
    }, function() {
        $(this).not("animated").parent().children("ul").stop().slideUp()
        $(this).not("animated").css({ backgroundImage: "url(/img/common/del2_open.png)" })
    })

    $(".del3 > a").toggle(function() {
        $(this).not("animated").parent().children("ul").slideDown()
        $(this).not("animated").css({ backgroundImage: "url(/img/common/del2_close.png)" })

        return false;
    }, function() {
        $(this).not("animated").parent().children("ul").stop().slideUp()
        $(this).not("animated").css({ backgroundImage: "url(/img/common/del2_open.png)" })
    })


    find_location();
})

function initMap() { //그냥 init임
    var pos = {
        lat: 36.144598,
        lng: 128.393269
    };

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: pos,
        mapTypeId: 'roadmap'
    });
    var marker = new google.maps.Marker({
        position: pos,
        map: map
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

function find_location() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            location_xy = position.coords.latitude + ":" + position.coords.longitude;
            // infoWindow.setPosition(pos);
            // infoWindow.setContent('Location found -> ' + pos.lat + ":" + pos.lng);
            // map.setCenter(pos);
            openweather(location_xy);
            var geocode = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&key=AIzaSyAmN75yGf-ADS4d5GMBkQXd_3RqzB973U4";
            $.ajax({
                url: geocode,
                type: 'POST',
                success: function(msg) {
                    var gps_location = msg.results[0].address_components[3].long_name + " " + msg.results[0].address_components[2].long_name; //시를 불러옴
                    $("#location", "#weaTable").html(gps_location);
                }
            })
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

}


function openweather(location) {

    var weaTable = document.getElementById("weaTable");
    var location_ary = location.split(':');
    var weather = 'https://api.openweathermap.org/data/2.5/weather?lat=' + location_ary[0] + '&lon=' + location_ary[1] + '&appid=5a4c2fcb63a04bce9247f10383713467';


    $.ajax({
        url: weather,
        type: 'GET',
        cache: false,
        success: function(msg) {
            var temp = msg.main.temp - 273; //현재 온도
            var wind = msg.wind.speed;
            var humidity = msg.main.humidity; //습도 %
            var weather = msg.weather[0].description; //날씨 상태

            weaTable.rows[1].cells[1].innerHTML = parseInt(temp) + "℃"; //현재 온도
            weaTable.rows[1].cells[2].innerHTML = wind + "m/s"; //바람 
            weaTable.rows[2].cells[0].innerHTML = humidity + "%";
            if (weather == "clear sky") {
                weaTable.rows[1].cells[0].firstElementChild.src = "../img/main/sun02.png";
                $("#sky", "#weaTable").html("맑음");
            } else if (weather == "few clouds") {
                weaTable.rows[1].cells[0].firstElementChild.src = "../img/main/cloud01.png";
                $("#sky", "#weaTable").html("구름 조금");
            } else if (weather == "scattered clouds") {
                weaTable.rows[1].cells[0].firstElementChild.src = "../img/main/cloud03.png";
                $("#sky", "#weaTable").html("구름 많음");
            } else if (weather == "broken clouds") {
                weaTable.rows[1].cells[0].firstElementChild.src = "../img/main/cloud02.png";
                $("#sky", "#weaTable").html("흐림");
            } else if (weather == "rain") {
                weaTable.rows[1].cells[0].firstElementChild.src = "../img/main/rain.png";
                $("#sky", "#weaTable").html("비");
            } else if (weather == "thunderstorm") {
                weaTable.rows[1].cells[0].firstElementChild.src = "../img/main/storm.png";
                $("#sky", "#weaTable").html("번개/천둥");
            } else if (weather == "snow") {
                weaTable.rows[1].cells[0].firstElementChild.src = "../img/main/snow.png";
                $("#sky", "#weaTable").html("눈");
            } else if (weather == "mist") {
                weaTable.rows[1].cells[0].firstElementChild.src = "../img/main/mist.png";
                $("#sky", "#weaTable").html("안개");
            }

        },
        error: function(request, status, error) {
            alert("다시 시도해주세요.\n" + "code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        }
    });
}