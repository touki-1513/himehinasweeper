var app = new Vue({
	el: '#mineApp',
	data: {
		height: 10,
		width: 10,
		ratio: 0.1,
		boxes: [],
		numBoms: 0,
		numPushedBoxes: 0,
		isStart: false,
		isSuccess: false,
		isFailure: false,
		timer: '',
		begin: '',
		duration: '',
		classes: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'unknown', 'flag', 'bomb']
	},
	methods: {
		start: function() {
			this._init(false);
			this.isStart = true;
			this._setBombs();
			this._countBombs();
			this.begin = new Date();
			this.timer = setInterval(() => {
				this.duration = ((new Date() - this.begin) / 1000).toFixed(1)
			}, 1 / 10);
		},
		reset: function() {
			this._init(true);
		},
		_init: function(isAll) {
			if (isAll) {
				this.height = 10;
				this.width = 10;
				this.ratio = 0.1;
			}
			this.boxes = [];
			this.numBoms = 0;
			this.numPushedBoxes = 0;
			this.isStart = false;
			this.isSuccess = false;
			this.isFailure = false;
			clearInterval(this.timer);
			this.begin = '';
			this.duration = '';
		},
		_setBombs: function() {
			for (var y = 0; y < this.height; y++) {
				var row = [];
				for (var x = 0; x < this.width; x++) {
					row.push({
						index: y * this.width + x,
						hasBomb: Math.random() < this.ratio,
						isPushed: false,
						isFlagged: false,
						numNeighborBombs: 0,
						char: ''
					});
				}
				this.boxes.push(row);
			}
		},
		_countBombs: function() {
			for (var y = 0; y < this.height; y++) {
				for (var x = 0; x < this.width; x++) {
					var box = this.boxes[y][x]
					if(box.hasBomb) {
						this.numBoms += 1;
						box.numNeighborBombs = 9;
						continue;
					}
					for (var j = (y > 0 ? -1 : 0); j <= ( y < this.height - 1 ? 1 : 0); j++) {
						for (var i = (x > 0 ? -1 : 0); i <= (x < this.width - 1 ? 1 : 0); i++) {
							if (j === 0 && i === 0) {
								continue;
							} else if (this.boxes[y + j][x + i].hasBomb) {
								box.numNeighborBombs += 1;
							}
						}
					}
				}
			}
		},
		open: function(index) {
			var y = index / this.width | 0;
			var x = index % this.width;
			var box = this.boxes[y][x];
			if (box.isPushed || box.isFlagged) {
				return;
			}
			if (box.hasBomb) {
				this.isFailure = true;
				this._openAll();
				clearInterval(this.timer);
				return;
			}

			box.isPushed = true;
			this.numPushedBoxes += 1;
			this._replaceChar(box);
			if (box.numNeighborBombs === 0) {
				this._recursive(index, y, x);
			}
			if (this.numPushedBoxes === this.height * this.width - this.numBoms) {
				this.isSuccess = true;
				this._openAll();
				clearInterval(this.timer);
			}
		},
		_replaceChar: function(box) {
			if (box.hasBomb) {
				box.char = 'x';
				box.classIndex = 11;
			} else if (box.numNeighborBombs > 0) {
				box.char = box.numNeighborBombs;
				box.classIndex = box.numNeighborBombs;
			} else {
				box.char = '-';
				box.classIndex = 0;
			}
		},
		_openAll: function() {
			for (var y = 0; y < this.height; y++) {
				for (var x = 0; x < this.width; x++) {
					var box = this.boxes[y][x];
					if (!box.isPushed) {
						this._replaceChar(box);
					}
				}
			}
		},
		_recursive: function(index, y, x) {
			for (var j = (y > 0 ? -1 : 0); j <= (y < this.height - 1 ? 1 : 0); j++) {
				for (var i = (x > 0 ? -1 : 0); i <= (x < this.width - 1 ? 1 : 0); i++) {
					if (j === 0 && i === 0) {
						continue;
					}
					var neighbor_box = this.boxes[y + j][x + i];
					if (!neighbor_box.isPushed) {
							this.open(index + j * this.width + i);
					}
				}
			}
		}
	}
});

Vue.component("box-template", {
	template: "#box-template",
	props: {
		b: Object
	},
	methods: {
		push: function() {
			this.$emit("open", this.b.index);
		},
		flag: function(e) {
			if (this.b.isPushed) {
				return;
			}
			this.b.isFlagged = !this.b.isFlagged;
			if (this.b.isFlagged) {
				this.b.char = '?';
				this.b.classIndex = 10;
			} else {
				this.b.char = '';
				this.b.classIndex = 9;
			}
			e.preventDefault();
		}
	}
});