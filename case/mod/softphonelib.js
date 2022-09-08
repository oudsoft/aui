module.exports = function ( jq ) {
	const $ = jq;

  let sipSession = undefined;
  let rtcSession = undefined;

  const realm = '202.28.68.6';
  const wsUrl = 'wss://' + realm + ':8089/ws';

	//const realm = 'radconnext.me';
  //const wsUrl = 'wss://' + realm + '/ws';

	const eventHandlers = {
	  'progress': function(e) {
	    console.log('call is in progress ...');
	  },
	  'failed': function(e) {
	    console.log('call failed with cause: ', e/*.data.cause*/);
	  },
	  'ended': function(e) {
	    console.log('call ended with cause: ', e/*.data.cause*/);
	  },
	  'confirmed': function(e) {
	    console.log('call confirmed ...', e);
	  }
	};

  const callOptions = {
		eventHandlers: eventHandlers,
    mediaConstraints : { 'audio': true, 'video': false },
    rtcOfferConstraints: {'offerToReceiveAudio': true, 'offerToReceiveVideo': false},
    sessionTimersExpires: 7200
  };

  const doRegisterSoftphone = function(softNumber, secret){
		let socket = new JsSIP.WebSocketInterface(wsUrl);
		socket.onmessage = function(msgEvt){
	    let data = JSON.parse(msgEvt.data);
	    console.log(data);
	  }

    let sipUri = 'sip:' + softNumber + '@' + realm;
    let sipConfiguration = {
      sockets: [ socket ],
      authorization_user: softNumber,
      uri: sipUri,
      password: secret,
      ws_servers: wsUrl,
      realm: realm,
      display_name: softNumber,
      contact_uri: sipUri
    };

		let ua = new JsSIP.UA(sipConfiguration);

    ua.on('connected', function(e){
      console.log('Your are ready connected to your socket.', e);
    });

    ua.on('registered', function(e){
      console.log('Your are ready registered.', e);
    });

    ua.on('unregistered', function(e){
      console.log('Your are ready unregistered.', e);
    });

    ua.on('registrationFailed', function(e){
      console.log('Your are registrationFailed.', e);
    });

    ua.on('disconnected', function(e){
      console.log('Your are ready dis-connected.', e);
    });

    //ua.start();
    ua.on("newRTCSession", function(data){
      rtcSession = data.session;
      sipSession = rtcSession;
      if (rtcSession.direction === "incoming") {
        // incoming call here
        console.log(rtcSession);
        $('#SipPhoneIncomeBox').css({'top': '10px'});
        let ringAudio = document.getElementById('RingAudio');
        ringAudio.play();
        rtcSession.on('failed', function (e) {
          console.log('connecttion failed', e);
          ringAudio.pause();
          let remoteAudio = document.getElementById('RemoteAudio');
					doClearTracks(remoteAudio);
					doHiddenSoftPhoneBox();
        });
      }
    });

    return ua;
  }

	const doRejectCall = function(evt){
		doHangup(evt);
	}

	const doEndCall = function(evt){
		doHangup(evt);
	}

	const doAcceptCall = function(evt){
		rtcSession.on("accepted",function(e){
	    // the call has answered
	    console.log('onaccept', e);
	  });
	  rtcSession.on("confirmed",function(e){
	    // this handler will be called for incoming calls too
	    console.log('onconfirm', e);
	    var from = e.ack.from._display_name;
			console.log(from);
	  });
	  rtcSession.on("ended",function(e){
	    // the call has ended
	    console.log('onended', e);
	    var remoteAudio = document.getElementById('RemoteAudio');
	    doClearTracks(remoteAudio);
			doHiddenSoftPhoneBox();
	  });
	  rtcSession.on("failed",function(e){
	    // unable to establish the call
	    console.log('onfailed', e);
			var remoteAudio = document.getElementById('RemoteAudio');
	    doClearTracks(remoteAudio);
			doHiddenSoftPhoneBox();
	  });

	  // Answer call
	  rtcSession.answer(callOptions);

	  rtcSession.connection.addEventListener('addstream', function (e) {
	    var remoteAudio = document.getElementById("RemoteAudio");
	    remoteAudio.srcObject = e.stream;
	    setTimeout(() => {
	      remoteAudio.play();
	      $('#SipPhoneIncomeBox').find('#IncomeBox').css({'display': 'none'});
	      $('#SipPhoneIncomeBox').find('#AnswerBox').css({'display': 'block'});
	    }, 500);
	  });
	}

	const doClearTracks = function(audio){
	  var stream = audio.srcObject;
	  if (stream){
	    var tracks = stream.getTracks();
	    if (tracks){
	      tracks.forEach(function(track) {
	        track.stop();
	      });
	    }
	  }
	}

	const doHangup = function(evt){
	  if (sipSession){
	    console.log(sipSession);
	    sipSession.terminate();
	    let remoteAudio = document.getElementById('RemoteAudio');
			doClearTracks(remoteAudio);
			doHiddenSoftPhoneBox();
	  }
	}

	const doHiddenSoftPhoneBox = function(){
		$('#SipPhoneIncomeBox').find('#IncomeBox').css({'display': 'block'});
		$('#SipPhoneIncomeBox').find('#AnswerBox').css({'display': 'none'});
		$('#SipPhoneIncomeBox').css({'top': '-65px'});
	}

  return {
		callOptions,
    doRegisterSoftphone,
		doRejectCall,
		doAcceptCall,
		doEndCall
	}
}
