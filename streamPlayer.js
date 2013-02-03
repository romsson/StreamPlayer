/**
 * StreamPlayer 0.1
 * Romain Vuillemot
 */
var StreamPlayer = function(player, options) {
	if(typeof(player) == 'string') {
		player = document.getElementById(player);
	}
	if(!player) {
		return;
	}
	var handle = player.getElementsByTagName('div')[0];
	this.init(player, handle, options || {});
	this.setup();
};

StreamPlayer.prototype.init = function(player, handle, options) {
	this.callback = options.callback || null;	
	this.displayUpdate = options.displayUpdate || null;
	this.playCallback = options.playCallback || null;
	this.pauseCallback = options.pauseCallback || null;
	this.stopCallback = options.stopCallback || null;
	this.updateCallback = options.updateCallback || null;	
	this.nextCallback = options.nextCallback || null;		
	this.previousCallback = options.previousCallback || null;		
	this.ffCallback = options.ffCallback || null;
	this.fbCallback = options.fbCallback || null;			
	this.refreshCallback = options.refreshCallback || this.refreshCallback;
	this.current_time = options.current_time || null;

	this.player = player;
	this.handle = handle;
	this.options = options;
	
	this.refreshIntervalId = null;
	this.buffer_count = 0;
	this.buffered_data = [];
	this.current_value = null;
	
	this.auto_start = this.getOption('auto_start', true);
	this.is_playing = this.auto_start;

	this.is_buffering = this.getOption('is_buffering', false);
	this.current_speed = this.getOption('current_speed', 1000);	
	this.buffered_pause = true;	
	
	this.addListeners();

	this.max_speed = 4000;
	this.min_speed = 100;

	self = this;
}
	
StreamPlayer.prototype.addListeners = function() {

	this.player.onclick = function(e) {

		if(e.target.className.search(/(^|\s)stop(\s|$)/) != -1 && typeof(self.stopCallback) == 'function') {
			self.stopCallback(self);
			self.update();

		} else if(e.target.className.search(/(^|\s)play(\s|$)/) != -1 && typeof(self.playCallback) == 'function') {
			self.playCallback(self);
			e.target.className = e.target.className.replace(/\s?play/g, '');
			e.target.className += " pause";
			self.is_buffering = false;
			self.is_playing = !self.is_playing;
			self.refreshIntervalId = setInterval(function () {return self.updateCallback(self);}, self.current_speed);
			self.update();

		} else if(e.target.className.search(/(^|\s)pause(\s|$)/) != -1 && typeof(self.pauseCallback) == 'function') {
			self.pauseCallback();
			e.target.className = e.target.className.replace(/\s?pause/g, '');
			e.target.className += " play";
			clearInterval(self.refreshIntervalId);
			self.is_playing = !self.is_playing;
			self.update();
				
		} else if(e.target.className.search(/(^|\s)next(\s|$)/) != -1 && typeof(self.nextCallback) == 'function') {
			self.nextCallback(self);
			self.update();

		} else if(e.target.className.search(/(^|\s)prev(\s|$)/) != -1 && typeof(self.previousCallback) == 'function') {
			self.previousCallback(self);
			self.update();

		} else if(e.target.className.search(/(^|\s)ff(\s|$)/) != -1 && typeof(self.ffCallback) == 'function') {

			if(self.current_speed<self.max_speed) {
				self.current_speed=self.current_speed/2;

				if(self.is_playing) {
					clearInterval(self.refreshIntervalId);
					self.refreshIntervalId = setInterval(function () {
						self.updateCallback(self);
						self.update();
						return ;
					}, self.current_speed);
				}

				e.target.className.replace(/\s?disabled/g, '');
				self.ffCallback();
				document.getElementsByClassName("fb")[0].className = document.getElementsByClassName("fb")[0].className.replace(/\s?disabled/g, '');
				document.getElementsByClassName("fb")[0].disabled = false;
			}

			if(self.current_speed==self.max_speed) {
				if(e.target.className.search(/(^|\s)disabled(\s|$)/) == -1) {
					e.target.className += " disabled";
					e.target.disabled = true;
				}
			}

		} else if(e.target.className.search(/(^|\s)fb(\s|$)/) != -1 && typeof(self.fbCallback) == 'function') {
			
			if(self.current_speed>self.min_speed) {

				self.current_speed=self.current_speed*2;

				if(self.is_playing) {
					clearInterval(self.refreshIntervalId);
					self.refreshIntervalId = setInterval(function () {
						self.updateCallback(self);
						self.update();
						return ;
					}, self.current_speed);
				}
				e.target.className.replace(/\s?disabled/g, '');

				self.fbCallback();
				document.getElementsByClassName("ff")[0].className = document.getElementsByClassName("ff")[0].className.replace(/\s?disabled/g, '');
				document.getElementsByClassName("ff")[0].disabled = false;
			} 

			if(self.current_speed==self.min_speed) {
				if(e.target.className.search(/(^|\s)disabled(\s|$)/) == -1) {
					e.target.className += " disabled";
					e.target.disabled = true;
				}
			}
		}
		self.refreshCallback(self);
	}
}

StreamPlayer.prototype.setup = function() {
	this.addListeners();
	this.update();

	if((self.current_speed==self.min_speed) && document.getElementsByClassName("fb").length > 1 && document.getElementsByClassName("fb")[0].className.search(/(^|\s)disabled(\s|$)/) == -1) {
		document.getElementsByClassName("fb")[0].className += " disabled";
		document.getElementsByClassName("fb")[0].disabled = false;
	}

	if((self.current_speed==self.min_speed) && document.getElementsByClassName("fb").length > 1 && document.getElementsByClassName("fb")[0].className.search(/(^|\s)disabled(\s|$)/) == -1) {
		document.getElementsByClassName("fb")[0].className += " disabled";
		document.getElementsByClassName("fb")[0].disabled = false;
	}

	if(typeof(self.current_time) == 'function' && self.current_time()==0) {
		if(document.getElementsByClassName("prev").length>0 && document.getElementsByClassName("prev")[0].className.search(/(^|\s)disabled(\s|$)/) == -1) {
			document.getElementsByClassName("prev")[0].className += " disabled";
			document.getElementsByClassName("prev")[0].disabled = true;
		}
	} else {
		if(document.getElementsByClassName("prev").length>0 && document.getElementsByClassName("prev")[0].className.search(/(^|\s)disabled(\s|$)/) == 1) {
			document.getElementsByClassName("prev")[0].className.replace(/\s?disabled/g, '');
			document.getElementsByClassName("prev")[0].disabled = false;
		}
	}
}

StreamPlayer.prototype.getOption = function(name, defaultValue) {
	return this.options[name] !== undefined ? this.options[name] : defaultValue;
}

StreamPlayer.prototype.update = function() {
	if(self.auto_start && typeof(self.updateCallback) == 'function' && self.refreshIntervalId==null) {
		self.refreshIntervalId = setInterval(function () {
			self.updateCallback(self);
			self.update();
			return ;
		}, self.current_speed);
	}
	if(typeof(self.current_time) == 'function' && self.current_time()==0) {
		if(document.getElementsByClassName("prev").length>0 && document.getElementsByClassName("prev")[0].className.search(/(^|\s)disabled(\s|$)/) == -1) {
			document.getElementsByClassName("prev")[0].className += " disabled";
			document.getElementsByClassName("prev")[0].disabled = true;
		}
	} else {
		if(document.getElementsByClassName("prev").length>0 && document.getElementsByClassName("prev")[0].className.search(/(^|\s)disabled(\s|$)/)>0) {
			document.getElementsByClassName("prev")[0].className = document.getElementsByClassName("prev")[0].className.replace(/\s?disabled/g, '');
			document.getElementsByClassName("prev")[0].disabled = false;
		}
	}
}

StreamPlayer.prototype.refreshCallback = function() {
	return;
}