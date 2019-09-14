/* 이미지 겔러리 */
(function($) {
$.fn.nCarousel = function(o) {
    o = $.extend({
        btnPrev: null,
        btnNext: null,
        btnGo: null,
        mouseWheel: false,
        auto: null,

        speed: 200,
        easing: null,

        vertical: false,
        circular: true,
        visible: 4,
        start: 0,
        scroll: 1,

        centerFocus: false, // 가운데 이미지 확대여부
        focusSizeW:150,        // 확대되는 이미지의 폭
        focusSizeH:245,   
        clickMove: false,    // 클릭된 이미지 이동 여부

        dispLayer: null,    // 디스플레이 대상 영역
        dispTag: null, // 디스플레이 영역에 표현될 컨텐츠 영역
        dispName: '',    // 디스플레이 영역에 표현될 이미지 추가 이름
		autoDisp: false,

        beforeStart: null,
        afterEnd: null,
       
        linkOn: false, // 이벤트 발생후 링크를 작동 시킬지 결정
        listType: 'ul'    // 리스트 타입
    }, o || {});

    return this.each(function() {
        var running = false,
            animCss = o.vertical ? "top" : "left",
            sizeCss = o.vertical ? "height" : "width";

        var div = $(this),
            ul = $(o.listType, div),
            tLi = $("li", ul),
            tl = tLi.size(),
            v = o.visible;

        if(o.circular) {
            ul.prepend(tLi.slice(tl-v-1+1).clone())
                .append(tLi.slice(0,v).clone());
            o.start += v;
        }

        var li = $("li", ul),
            itemLength = li.size(),
            curr = o.start,
            oWidth = li.find('img').width(),
            oHeight = li.height(),
			autoInt,
            centerPos = parseInt(o.visible / 2);

        if(o.centerFocus && 1 == o.visible % 2){
            for(var i = 0; i < li.size(); i++){
                $('img', li[i]).css({width: o.reduceSize});
            }
        }

        li.css({overflow: "hidden", float: o.vertical ? "none" : "left"});
        ul.css({margin: "0", padding: "0", position: "relative", "list-style-type": "none", "z-index": "1"});
        div.css({overflow: "hidden", position: "relative", "z-index": "2", left: "0px", visibility: "visible"});

        var liSize = o.vertical ? height(li) : width(li);   // 애니메이션을 위한 아이템의 길이
        var ulSize = liSize * itemLength;    // 보여지지 않는 아이템을 포함한 전체 길이
        var divSize = liSize * v;

        li.css({width: li.width(), height: li.height()});
        ul.css(sizeCss, ulSize+"px").css(animCss, -(curr*liSize));
        div.css(sizeCss, divSize+"px");                     // 리스트 표시 영역 크기. 보여지는 아이템의 전체길이

        if(o.centerFocus && 1 == o.visible % 2){
            var ulWidth = ulSize + o.focusSizeW - li.width();
            var divWidth = divSize + o.focusSizeW - li.width();
            ul.css({width: ulWidth});
            div.css({width: divWidth});
        }
        
        li.find('img').click(function(event){    // 개별 이미지 클릭시 디스플레이 및 이동
			var obj = $(this);

 			if(o.dispLayer){

				for(var x = 0; x < o.dispLayer.length; x++){
					if(o.dispTag[x] == 'img'){
						var image = obj.attr('src').split('.');
						var iamgeSrc = obj.attr('src').replace('.' + image[image.length - 1], o.dispName + '.' + image[image.length - 1]);
						if(!o.centerFocus) {
							$('> img:first', o.dispLayer[x]).attr('src', iamgeSrc);
							$('> img:first', o.dispLayer[x]).attr('alt', obj.attr('alt'));
						}
					}else if(o.dispTag[x] == 'p'){
						if(!o.centerFocus) {
							if(obj.parent().get(0).nodeName == 'LI'){
								$(o.dispLayer[x]).text(obj.parent().find(o.dispTag[x]).filter(':first').clone().text());
							}else{
								$(o.dispLayer[x]).text(obj.parent().next(o.dispTag[x]).filter(':first').clone().text());
							}
						}
					}
				}
			}

            var movePos;

            for (var i = 0; i < itemLength; i++){
                if(li.find('img')[i] == obj){
                    if (i != curr + centerPos) {
                         movePos = i - curr - centerPos;                       
                    }
                }
            }

            if (o.clickMove){
                go(curr + movePos);
            }

            if(!o.linkOn){
                event.preventDefault();
			}
        });

		li.find('img').mouseover(function(){ 
			stopAuto();
		});

		li.find('img').mouseout(function(){
			runAuto();
		});

        li.find('img').focus(function(){
            return false;
        });

        if(o.btnPrev){
            $(o.btnPrev).click(function() {
            	if(curr==0){
            		alert("다음 사진이 없습니다.");
            	}
                return go(curr-o.scroll);
            });
			$(o.btnPrev).bind("mouseover focus", function(){ 
				stopAuto();
			});
			$(o.btnPrev).bind("mouseout blur", function(){ 
				runAuto();
			});
		}

        if(o.btnNext){
            $(o.btnNext).click(function() {
            	if(curr==itemLength-v){
            		alert("다음 사진이 없습니다.");
            	}
                return go(curr+o.scroll);
            });
			$(o.btnNext).bind("mouseover focus", function(){ 
				stopAuto();
			});
			$(o.btnNext).bind("mouseout blur", function(){ 
				runAuto();
			});
		}

        if(o.btnGo)
            $.each(o.btnGo, function(i, val) {
                $(val).click(function() {
                    return go(o.circular ? o.visible+i : i);
                });
            });

        if(o.mouseWheel && div.mousewheel)
            div.mousewheel(function(e, d) {
                return d>0 ? go(curr-o.scroll) : go(curr+o.scroll);
            });

		runAuto();

		function stopAuto() {
			if(o.auto){
				clearInterval(autoInt);
			}
		}

		function runAuto() {
			if(o.auto){
				autoInt = setInterval(function() {
					go(curr+o.scroll);
				}, o.auto+o.speed);
			}
		}

        function vis() {
            return li.slice(curr).slice(0,v);
        };

        function disp() {   // 리스트의 지정된 컨텐츠를 다른 곳에 추가로 디스플레이
            if(o.dispLayer && o.autoDisp){

for(var x = 0; x < o.dispLayer.length; x++){

                var data;
				var dispArea = $(o.dispLayer[x]);
                if(1 == o.visible % 2){ // visible이 홀수인경우 가운데, 아닌경우 첫번째 영역 내용 표시
                    data = $(o.dispTag[x] ,li[curr + centerPos]).clone();
                } else {
                    data = $(o.dispTag[x] ,li[curr]).clone();
                }

				if(o.dispTag[x] == 'img'){
                    var image = data.attr('src').split('.');
                    var iamgeSrc = data.attr('src').replace('.' + image[image.length - 1], o.dispName + '.' + image[image.length - 1]);
					if(0 == $('> img', dispArea).size()){
						dispArea.append("<img src='' alt='' />");
					}
					$('> img:first', dispArea).attr('src', iamgeSrc);
					$('> img:first', dispArea).attr('alt', data.attr('alt'));
				}else if (o.dispTag[x] == 'p'){
					dispArea.text(data.text());
				}else{
					dispArea.html(data.html());
				}

}
            }
        }

        function resize() {
            if(o.centerFocus && 1 == o.visible % 2){
                for(var i = 0; i < itemLength; i++){
                    if(i == curr + centerPos){
                        $(li[i]).css({width: o.focusSizeW, height: o.focusSizeH, margin: "0"});
                        $('img', li[i]).css({width: o.focusSizeW, height: o.focusSizeH});
                    } else {
                        var marginTop = parseInt(oHeight / 2);
                        $(li[i]).css({width: oWidth, height: oHeight, margin: marginTop + "px 0 0 0"});
                        $('img', li[i]).css({width: oWidth, height: oHeight});
                    }
                }
            }
        }

        resize();
        disp();

        function go(to) {

            if(!running){
                if(o.beforeStart)
                    o.beforeStart.call(this, vis());

				if(o.circular){            // If circular we are in first or last, then goto the other end
                    if(to<=o.start-v-1) {           // If first, then goto last
                        ul.css(animCss, -((itemLength-(v*2))*liSize)+"px");
                        // If "scroll" > 1, then the "to" might not be equal to the condition; it can be lesser depending on the number of elements.
                        curr = to==o.start-v-1 ? itemLength-(v*2)-1 : itemLength-(v*2)-o.scroll;
                    } else if(to>=itemLength-v+1) { // If last, then goto first
                        ul.css(animCss, -( (v) * liSize ) + "px" );
                        // If "scroll" > 1, then the "to" might not be equal to the condition; it can be greater depending on the number of elements.
                        curr = to==itemLength-v+1 ? v+1 : v+o.scroll;
                    } else curr = to;
                } else {                    // If non-circular and to points to first or last, we just return.
                    if(to<0 || to>itemLength-v) return;
                    else curr = to;
                }                           // If neither overrides it, the curr will still be "to" and we can proceed.

                running = true;

                ul.animate(
                    animCss == "left" ? { left: -(curr*liSize) } : { top: -(curr*liSize) } , o.speed, o.easing,
                    function() {
                        if(o.afterEnd)
                            o.afterEnd.call(this, vis());
                        running = false;
                    }
                );

                // Disable buttons when the carousel reaches the last/first, and enable when not
                if(!o.circular){
                    $(o.btnPrev + "," + o.btnNext).removeClass("disabled");
                    $( (curr-o.scroll<0 && o.btnPrev)
                        ||
                       (curr+o.scroll > itemLength-v && o.btnNext)
                        ||
                       []
                     ).addClass("disabled");
                }
            }
            disp();
            resize();
            return false;
        };
    });
};

function css(el, prop) {
    return parseInt($.css(el[0], prop)) || 0;
};
function width(el) {
    return  el[0].offsetWidth + css(el, 'marginLeft') + css(el, 'marginRight');
};
function height(el) {
    return el[0].offsetHeight + css(el, 'marginTop') + css(el, 'marginBottom');
};

})(jQuery);

function useTab(node1, node2, node3, isOff, png){
	var wrapId = node1;
	var btnTag = (!node2 ? 'h2' : node2);
	var contTag = (!node3 ? 'ul' : node3);
	var offString = (!isOff ? '' : isOff);
	var isPng = (png&&jQuery.browser.version < 7&&jQuery.browser.msie ? true : false);
	var onString = 'On';
	var menus = $(wrapId + '>' + btnTag);
	
	$(wrapId).addClass('script');

	$(menus).each(function(i){
		$(this).find('a').bind('focusin mouseover', function(){focusEvent(i)});

		if(i == 0){
			$(menus[i]).next(contTag).show();

			if(isPng){
				var path = $(menus[i]).find('img').attr('src').replace(onString, '').split('.png');
				var dataLength = path.length;
				$(menus[i]).find('img').attr('style.filter', "\"progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'\"" + path[dataLength-2] + onString + '.png' + "\"\',sizingMethod=\'image\');\"");
			}
			if($(wrapId + '> p')[i]) $(wrapId + '> p')[i].style.zIndex = 1;
		}else{

			$(menus[i]).next(contTag).hide();
			if($(menus[i]).find('img')){
				if(isPng){
					var path = $(menus[i]).find('img').attr('src').replace(onString, '').replace(offString, '').split('.png');
					var dataLength = path.length;
					$(menus[i]).find('img').attr('style.filter', "\"progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'\"" + path[dataLength-2] + offString + '.png' + "\"\',sizingMethod=\'image\');\"");
				}else{				
					var data = $(menus[i]).find('img').attr('src').replace(onString, '').replace(offString, '').split('.gif');
					var dataLength = data.length;
					$(menus[i]).find('img').attr('src', data[dataLength-2] + offString + '.gif');
				}
			}
		}
	});	

	function focusEvent(x){
		if($(menus[x]).find('img')) {
			if(isPng){
				var data = $(menus[x]).find('img').attr('style').replace(onString, '').replace(offString, '').split('.png');
				var dat = data[0].split('src=');
				$(menus[x]).find('img')[0].style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src=" + dat[1] + onString + '.png' + "\',sizingMethod=\'image\');";
			}else{	
				var data = $(menus[x]).find('img').attr('src').replace(onString, '').replace(offString, '').split('.gif');
				var dataLength = data.length;
				$(menus[x]).find('img').attr('src',  data[dataLength-2] + onString + '.gif');
			}
			if($(wrapId + '> p')[x]) $(wrapId + '> p')[i].style.zIndex = 1;
		}

		$(menus[x]).css({'z-index':'2'});
		$(menus[x]).addClass('On');
		$(menus[x]).next(contTag).show();

		for (var i = 0; i < menus.length; i++ ){

			if(i != x){
				if($(menus[i]).find('img')){
					if(isPng){
						var data = $(menus[i]).find('img').attr('style').replace(onString, '').replace(offString, '').split('.png');
						var dat = data[0].split('src=');
						$(menus[i]).find('img')[0].style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src=" + dat[1] + offString + '.png' + "\',sizingMethod=\'image\');";
					}else{	
						var data = $(menus[i]).find('img').attr('src').replace(onString, '').replace(offString, '').split('.gif');
						var dataLength = data.length;
						$(menus[i]).find('img').attr('src', data[dataLength-2] + offString + '.gif');
					}
				}
				$(menus[i]).css({'z-index':'0'});
				$(menus[i]).removeClass('On');
				$(menus[i]).next(contTag).hide();
				if($(wrapId + '> p')[i]) $(wrapId + '> p')[i].style.zIndex = -1;
			}
		}
	}
}

function rollBanner(id, button, intv, btnon, btnoff){
	this.id = id;
	this.button = button;
	this.intv = intv ? intv : false;

	var btnPath;
	var btnName;
	var btnOn = (!btnon?'On':btnon);
	var btnOff = (!btnoff?'':btnoff);

	var bDiv = document.getElementById(this.id);
	var bUl = bDiv.getElementsByTagName('ol')[0];
	var bList = bUl.getElementsByTagName('li');
	var bHeight = bList[0].getElementsByTagName('img')[0].height;
	var length = bList.length;

//	bDiv.style.overflow = "hidden";
//	CSS 에서 overflow hidden 시킬 경우 JS 미사용시 레이아웃 유지, JS에서 할 경우 이미지 펼침
	var btnOver;
	var btnDiv = document.getElementById(this.button);
	var btnList = btnDiv.getElementsByTagName('img');
	var btnCount = btnList.length;
	var setAuto;
	var count = 0;

	addButton();

	for (var x = 0; x < length; x++ ){
		bList[x].getElementsByTagName('a')[0].onfocus = moveBanner;
		bList[x].getElementsByTagName('a')[0].onblur = startAuto;
		btnList[x].onmouseover = moveBanner;
		btnList[x].onmouseout = startAuto;
	}

	bList.onmouseover = bUl.onmouseover = stopAuto;
	bList.onmouseout = bUl.onmouseout = startAuto;

	if(btnCount == 0){
		btnDiv.onmouseover = moveBanner;
		btnDiv.onmouseout = startAuto;
	}

	change(count);

	if(intv){
		startAuto();
	}

	function addButton(unNum){
		if(btnCount == 0){
			var buttonHtml = '';
			for(var i = 0; i < length; i++){
				var j = "";
				if(!unNum){
					if(i < 10) j = "0"+(i+1);
					else j=i+1
				}
				if(i == count){
					buttonHtml += "<img src=\"" + btnPath + btnName + j + btnOn + ".gif\" alt=\""+j+"\" style=\"cursor:pointer;\" />";
				}else{
					buttonHtml += "<img src=\"" + btnPath + btnName + j + btnOff + ".gif\" alt=\""+j+"\" style=\"cursor:pointer;\" />";
				}
			}
			btnDiv.innerHTML = '';
			btnDiv.innerHTML = buttonHtml;
		}
	}

	this.add = function(path, name, on, off, unNum){
		btnPath = path;
		btnName = name;
		btnOn = on;
		btnOff = off;
		addButton(unNum);
	}

	function startAuto() {
		if(intv){
			clearInterval(setAuto);
			setAuto = setInterval(auto, intv);
		}
	}

	function stopAuto() {
		if(intv){
			clearInterval(setAuto);
		}
	}

	function moveBanner(event) {
		var srcPath;
		if(window.event){
			if(window.event.srcElement.nodeName != 'IMG'){
				srcPath = window.event.srcElement.getElementsByTagName('img')[0];
			}else{
				srcPath = window.event.srcElement;
			}
		} else {
			if(event.target.nodeName != 'IMG'){
				srcPath = event.target.getElementsByTagName('img')[0];
			}else{
				srcPath = event.target;
			}
		}
		for(var i = 0; i < length; i++){
			if(srcPath == btnList[i] || srcPath == bDiv.getElementsByTagName('img')[i]){
				count = change(i);
				stopAuto();
			}
		}
	}

	function auto(){
		count++;
		if(count >= length){
			count = 0;
		}
		count = change(count);
	}

	function change(num) {
		bUl.style.marginTop = bList[0].getElementsByTagName('img')[0].height * num * -1 + "px";
		for (var z= 0; z < length; z++){
			var name = btnList[z].src;
			var data = name.split('.gif');
			if(z == num){
				btnList[num].src = data[data.length - 2].replace(btnOff, btnOn) + '.gif';
			} else {
				btnList[z].src = data[data.length - 2].replace(btnOn, btnOff) + '.gif';
			}
		}
		return num;
	}
}

function rollOver(node, isOver){
	var wrapId = $(node);
	var overString = (!isOver ? 'On' : isOver);
	var imageOver = $(wrapId).find('a');

	$(imageOver).each(function(i){
		var path = $(imageOver[i]).find('img').attr('src').split(".gif");
		$(imageOver[i]).find('img').bind('focusin mouseover', function(){
			$(imageOver[i]).find('img').attr('src', path[0] + overString + '.' + path[1]);
		});
		$(imageOver[i]).find('img').bind('focusout mouseout', function(){
			$(imageOver[i]).find('img').attr('src', path[0] + '.' + path[1]);
		});
	});
}