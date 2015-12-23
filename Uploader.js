
$(document).ready(function() {
	$('form').submit(function(e) {

		var upload = new Uploader(this);
		upload.begin();

		e.preventDefault();
	});
});

var Uploader = function(form) {

	this.imageType = [".jpg", ".jpeg", ".png"];
	this.zipType = [".rar", ".zip"];

	this.form = form;
	this.fileInputs = $(form).find('input[type=file]');
	this.i = 0;
	this.j = 0;
	this.result = null;

};

Uploader.prototype.begin = function() {
	if (this.validate()) {
		this.POSTData();
	} else {
		//alert that contains error
	}
}

Uploader.prototype.POSTData = function() {
	var inputs = $(this.form).find("input, textarea").not("input[type=submit] , input[type=file]");
	var i = 0;
	var data = [];

	for (var i = 0; i < inputs.length; i++) {
		data.push({
			'name': inputs[i].name,
			'value': inputs[i].value
		});
	}

	var This = this;
	$.ajax({
		url: $(this.form).attr('action'),
		method: 'POST',
		data: data,
		cache: false,
		dataType: 'json',
		success: function(data) {
			This.uploadFile();
		},
		error: function(data) {
			console.log("error :" + JSON.stringify(data));
		}
	});
};

Uploader.prototype.validate = function() {

	for (var i = 0; i < this.fileInputs.length; i++) {
		for (var j = 0; j < this.fileInputs[i].files.length; j++) {

			//tt -> targetType
			var tt = JSON.stringify(this.fileInputs[i].getAttribute('accept'));
			var n = tt.search("image");

			// vfe -> valid files extension

			if (n > 0)
				vfe = this.imageType;
			else if (n = tt.search("compressed") > 0)
				vfe = this.zipType;
			else return false;

			var FileName = this.fileInputs[i].files[j].name;
			if (FileName.length > 0) {
				var flag = false;

				for (var i = 0; i < vfe.length; i++) {
					//ce -> curren extension to compare
					var ce = vfe[i];
					if (FileName.substr(FileName.length - ce.length, ce.length).toLowerCase() == ce.toLowerCase()) {
						flag = true;
						console.log('OK! The file ' + FileName + " is valid.");
						break;
					}
				}
				if (!flag) {
					return false;
				}
			}
		};
	};
	return true;
};

Uploader.prototype.uploadFile = function() {

	if (this.fileInputs[this.i] == undefined)
		return;
	if (this.fileInputs[this.i].files[this.j] == undefined) {
		this.j = 0;
		this.i++;
		this.uploadFile();
		return;
	}

	var formdata = new FormData();
	formdata.append(this.fileInputs[this.i].name, this.fileInputs[this.i].files[this.j++]);
	this.send(formdata);

};

Uploader.prototype.send = function(formdata) {
	var This = this;
	$.ajax({
		url: $(this.form).attr('action'),
		method: "POST",
		data: formdata,
		processData: false,
		contentType: false,
		xhr: function() {
			
			var done = 0;
			var total = 0;

			var xhr = new XMLHttpRequest();
			(xhr.upload || xhr).addEventListener('progress', function(e) {
				done = e.loaded;
				total = e.total;
				//done percentage = Math.round((done / total) * 100)
				//document.getElementById('msg').innerHTML = " progress: " + Math.round((done / total) * 100) + "%<br/>";
			});
			return xhr;
		},
		success: function(data) {
			This.uploadFile();
			//console.log("success :"+ JSON.stringify(data));
		},
		error: function(data) {
			console.log("error :" + JSON.stringify(data));
		}
	});
};
