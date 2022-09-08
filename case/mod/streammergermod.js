/* streammergermod.js */
const streamMerger = require('./video-stream-merger.js');

const CallcenterMerger = function(streams, mergOption) {
	this.merger = new streamMerger(mergOption);
	this.merger.addStream(streams[0], {
		index: 0,
		x: 0,
		y: 0,
		width: this.merger.width,
		height: this.merger.height,
		fps: 30,
		clearRect: true,
		audioContext: null,
		mute: true
	});

	var xmepos = this.merger.width * 0.24;
	var ymepos = this.merger.height * 0.25;

	if (streams[1]) {
		this.merger.addStream(streams[1], {
			index: 1,
			x: this.merger.width - xmepos,
			y: this.merger.height - ymepos,
			width: xmepos,
			height: ymepos,
			fps: 30,
			clearRect: true,
			mute: false
		});
	}

	/*
	var staticTextStream = createStaticTextStream('สด');
	this.merger.addStream(staticTextStream, {
		index: 2,
		x: 5,
		y: 10,
		width: 80,
		height: 50,
		mute: true
	});
	*/
	this.merger.start();
	return this.merger;
}

CallcenterMerger.prototype.getMerger = function() {
	return this.merger;
};

const createStaticTextStream = function(text) {
	$('body').append($('<div id="HiddenDiv"></div>'));
	var hiddenDiv = document.querySelector('#HiddenDiv');
	var drawer = document.createElement("canvas");
	drawer.style.display = 'none';
	hiddenDiv.appendChild(drawer);

	drawer.width = 80;
	drawer.height = 50;
	var ctx = drawer.getContext("2d");
	ctx.font = 'bold 30px THNiramitAS';
	ctx.fillStyle = 'red';
	ctx.textAlign = 'left';
	ctx.fillText(text, 10, 20);
	var stream = drawer.captureStream(25);
	return stream;
}

module.exports = {
	CallcenterMerger,
	createStaticTextStream
};
