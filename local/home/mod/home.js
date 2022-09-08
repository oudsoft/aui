/* home.js */

module.exports = function ( jq ) {
	const $ = jq;

  const doLoadHome = function(){
		$('body').append($('<div id="overlay"><div class="loader"></div></div>'));

	  $('body').loading({overlay: $("#overlay"), stoppable: true});

		$('body').loading('start');
		$('body').load('form/login.html', function(){
			$('#LeftSideBox').load('/lib/feeder/login-leftside.js', function(leftsideJS){
				let leftsideResult = eval(leftsideJS);
	      $('#LeftSideBox').empty().append($(leftsideResult.handle));
				$('#RightSideBox').load('/lib/feeder/login-form.js', function(formJS){
					let formResult = eval(formJS);
		      $('#RightSideBox').empty().append($(formResult.handle));
					$('body').loading('stop');
				});
			});
		});
	}

	return {
		doLoadHome
	}
}
