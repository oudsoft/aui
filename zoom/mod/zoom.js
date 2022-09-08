module.exports = function ( jq ) {
	const $ = jq;

  const ZoomMtg = require('@zoomus/websdk');

  //ZoomMtg.setZoomJSLib('../../../lib/zoom/lib', '/av');

  ZoomMtg.preLoadWasm();
  ZoomMtg.prepareJssdk();

  const API_KEY = "f5Y4ftqmR0aDM6GwCIc4Fg";
  const API_SECRET = "HwmSR6JyQa0sEa24cWZsTvOrUP5fL2i6VF7T";

  const testTool = window.testTool;

	const doCallApi = function(url, rqParams) {
		return new Promise(function(resolve, reject) {
			$.post(url, rqParams).then((response) => {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
		});
	}

	const doGetApi = function(url, rqParams) {
		return new Promise(function(resolve, reject) {
			$.get(url, rqParams).then((response) => {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
		});
	}

	const urlQueryToObject = function(url) {
  	let result = url.split(/[?&]/).slice(1).map(function(paramPair) {
  				return paramPair.split(/=(.+)?/).slice(0, 2);
  		}).reduce(function (obj, pairArray) {
  				obj[pairArray[0]] = pairArray[1];
  				return obj;
  		}, {});
  	return result;
  }

  const doLoadZoomInterface = function() {
    document.getElementById("display_name").value =
      "Local" +
      ZoomMtg.getJSSDKVersion()[0] +
      testTool.detectOS() +
      "#" +
      testTool.getBrowserInfo();
    document.getElementById("meeting_number").value = testTool.getCookie(
      "meeting_number"
    );
    document.getElementById("meeting_pwd").value = testTool.getCookie(
      "meeting_pwd"
    );
    if (testTool.getCookie("meeting_lang"))
      document.getElementById("meeting_lang").value = testTool.getCookie(
        "meeting_lang"
      );

    document.getElementById("meeting_lang").addEventListener("change", (e) => {
      testTool.setCookie(
        "meeting_lang",
        document.getElementById("meeting_lang").value
      );
      $.i18n.reload(document.getElementById("meeting_lang").value);
      ZoomMtg.reRender({ lang: document.getElementById("meeting_lang").value });
    });

    // copy zoom invite link to mn, autofill mn and pwd.
    document
      .getElementById("meeting_number")
      .addEventListener("input", function (e) {
        let tmpMn = e.target.value.replace(/([^0-9])+/i, "");
        if (tmpMn.match(/([0-9]{9,11})/)) {
          tmpMn = tmpMn.match(/([0-9]{9,11})/)[1];
        }
        let tmpPwd = e.target.value.match(/pwd=([\d,\w]+)/);
        if (tmpPwd) {
          document.getElementById("meeting_pwd").value = tmpPwd[1];
          testTool.setCookie("meeting_pwd", tmpPwd[1]);
        }
        document.getElementById("meeting_number").value = tmpMn;
        testTool.setCookie(
          "meeting_number",
          document.getElementById("meeting_number").value
        );
      });

    document.getElementById("clear_all").addEventListener("click", (e) => {
      testTool.deleteAllCookies();
      document.getElementById("display_name").value = "";
      document.getElementById("meeting_number").value = "";
      document.getElementById("meeting_pwd").value = "";
      document.getElementById("meeting_lang").value = "en-US";
      document.getElementById("meeting_role").value = 0;
      window.location.href = "/index.html";
    });

    document.getElementById("join_meeting").addEventListener("click", (e) => {
      console.log('tst');
      /*

      e.preventDefault();

      const meetingConfig = testTool.getMeetingConfig();
      console.log(meetingConfig);
      if (!meetingConfig.mn || !meetingConfig.name) {
        alert("Meeting number or username is empty");
        return false;
      }
      testTool.setCookie("meeting_number", meetingConfig.mn);
      testTool.setCookie("meeting_pwd", meetingConfig.pwd);

      const signature = ZoomMtg.generateSignature({
        meetingNumber: meetingConfig.mn,
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        role: meetingConfig.role,
        success: function (res) {
          console.log(res.result);
          meetingConfig.signature = res.result;
          meetingConfig.apiKey = API_KEY;
          const joinUrl = "/meeting.html?" + testTool.serialize(meetingConfig);
          console.log(joinUrl);
          window.open(joinUrl, "_blank");
        },
        fail: function(err) {
          console.log(err);
        }
      });
      */
    });

    // click copy jon link button
    window.copyJoinLink = function (element) {
      const meetingConfig = testTool.getMeetingConfig();
      if (!meetingConfig.mn || !meetingConfig.name) {
        alert("Meeting number or username is empty");
        return false;
      }
      const signature = ZoomMtg.generateSignature({
        meetingNumber: meetingConfig.mn,
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        role: meetingConfig.role,
        success: function (res) {
          console.log(res.result);
          meetingConfig.signature = res.result;
          meetingConfig.apiKey = API_KEY;
          const joinUrl =
            testTool.getCurrentDomain() +
            "/meeting.html?" +
            testTool.serialize(meetingConfig);
          $(element).attr("link", joinUrl);
          const $temp = $("<input>");
          $("body").append($temp);
          $temp.val($(element).attr("link")).select();
          document.execCommand("copy");
          $temp.remove();
        },
      });
    };

  }

  return {
		doCallApi,
		doGetApi,
		urlQueryToObject,
		doLoadZoomInterface,
	}
}
