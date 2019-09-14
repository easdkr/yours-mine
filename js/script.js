const BASE_URL = 'https://202.31.200.146:8000/';
var socket = io();

function Rental() {
    var rentalTable = document.getElementById("rental01-2");
    var hisname = rentalTable.rows[3].cells[1].innerHTML;
    var myname = document.getElementById('userid').innerHTML;
    alert(hisname + myname + socket.id);
    socket.emit('join', { sendto: hisname, sendfrom: myname, mysocketid: socket.id });

}

function letsChat(hisname, roomid) {
    location.href = "/doc/chat?hisname=" + hisname + "&roomid=" + roomid;
}
socket.on('join', function(data) {
    alert('join', data.msg, data.roomid);
    location.href = "/doc/chat?hisname=" + data.sendto + "&roomid=" + data.roomid;
});

function logout() {
    var naverLogin = new naver.LoginWithNaverId({
        clientId: "qwViWTrRWYENoIjQzAP_",
        isPopup: false,
    });
    naverLogin.init();
    naverLogin.getLoginStatus(function(status) {
        if (status) {
            naverLogin.logout();
            $.ajax({
                type: 'GET',
                url: BASE_URL + "API/logout",
                timeout: 2000,
                success: function(data) {
                    alert(data + ' �Ǿ����ϴ�.');
                    // Server �� ���� �������̵� �� ������ ä�ù� �̸��� ���� �մϴ�.
                    socket.emit('logout', {
                        userid: userid,
                    });
                    location.reload("email, nickName, name, gender");
                },
                error: function(err) {
                    alert(err.error);
                    console.log(err);
                    //toastr.warning(err.responseJSON.message);
                }
            });
        }
    });
}