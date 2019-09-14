$("document").ready(function(){

var movesize = 246;
	var movesize1 = 242;
	var position = 0;
	var current = -1;
	var prev = null;
	var interval = null;
	var FADE_SPEED = 500;
	var DELAY_SPEED = 5000;
	var slides = $('.m_slide li');
	
	
	/* 메인 비쥬얼 */
	
	$('.m_slide li').css('opacity','0');

	for (var i = slides.length - 1; i >= 0 ; i--){
		$('#slide'+i).bind("click",{index:i},function(event){
			current = event.data.index;	
			gotoSlide(current);
		});
	};

	$(".v_btn01").bind("click",function(){
	if (current == 0 )
		{
			current = parseInt($("#bncnt").val()) - 1;
		}  else {
			current--;
		}
		gotoSlide(current)
	});

	$(".v_btn02").bind("click",function(){
		if (current == parseInt($("#bncnt").val()) - 1 )
			{
				current = 0 ;
			}  else {
				current++;
			}
			gotoSlide(current)
	});

		
	
	autoSlide();
	
	function autoSlide (){
		if (current >= slides.length -1){
			current = 0;
		} else {
			current++
		}
		gotoSlide(current);	
	}
	
	function gotoSlide(current){
		
		if (current != prev){
			$('#slide'+current).find("img").attr("src","/img/main/visual_btn_on.png");
			$('#slide'+prev).find("img").attr("src","/img/main/visual_btn.png");

			$(slides[prev]).stop().animate({'opacity':'0'},600);
			$(slides[current]).stop().animate({'opacity':'1'},600);

			prev = current;
			if (interval != null){
				clearInterval(interval);
			}
			interval = setInterval(autoSlide, DELAY_SPEED);
		}
	}

	/* END 메인 비쥬얼 */

})