var Controls = new function(){
	var inputs = {
		 seed: {
			elements: [
				document.getElementById("c-seed")
			]
			,value: "foo"
			,update: function(){
				this.value = this.elements[0].value;
				apply();
			}
		 }
		,treeCount: {
			elements: [
				document.getElementById("c-treeCount")
			]
			,value: 1
			,update: function(){
				var value = this.elements[0].value;
				if(value > 0){
					this.value = Math.round(value);
				} else {
					this.value = 1;
				}
				apply();
			}
		}
		,baseWidth: {
			elements: [
				 document.getElementById("c-baseWidth")
				,document.getElementById("c-baseWidthValue")
			]
			,value: 30
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					if(value > 0){
						this.value = value;
					} else {
						this.value = 1;
					}
				} else {
					this.value = 30;
				}
				apply();
			}
		}
		,lengthWidthRatio: {
			elements: [
				 document.getElementById("c-lengthWidthRatio")
				,document.getElementById("c-lengthWidthRatioValue")
			]
			,value: 10
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					if(value < 0){
						value = 0;
					}
					this.value = value;
				} else {
					this.value = 10;
				}
				apply();
			}
		}
		,lengthConstant: {
			elements: [
				 document.getElementById("c-lengthConstant")
				,document.getElementById("c-lengthConstantValue")
			]
			,value: 20
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					this.value = value;
				}
				apply();
			}
		}
		,lengthRandomness: {
			elements: [
				 document.getElementById("c-lengthRandomness")
				,document.getElementById("c-lengthRandomnessValue")
			]
			,value: 0.3
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					this.value = value;
				} else {
					this.value = 0.3;
				}
				apply();
			}
		}
		,bendiness: {
			elements: [
				 document.getElementById("c-bendiness")
				,document.getElementById("c-bendinessValue")
			]
			,value: 0.3
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					if(value != 0){
						this.value = value;
					}
				} else {
					this.value = 0.3;
				}
				apply();
			}
		}
		,angleSpan: {
			elements: [
				 document.getElementById("c-angleSpan")
				,document.getElementById("c-angleSpanValue")
			]
			,value: 60
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					this.value = value;
				}
				apply();
			}
		}
		,spanRandomness: {
			elements: [
				 document.getElementById("c-spanRandomness")
				,document.getElementById("c-spanRandomnessValue")
			]
			,value: 30
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					this.value = value;
				}
				apply();
			}
		}
		,angleRandomness: {
			elements: [
				 document.getElementById("c-angleRandomness")
				,document.getElementById("c-angleRandomnessValue")
			]
			,value: 20
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					this.value = value;
				}
				apply();
			}
		}
		,widthRandomness: {
			elements: [
				 document.getElementById("c-widthRandomness")
				,document.getElementById("c-widthRandomnessValue")
			]
			,value: 0.5
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					if(value < 0){
						value = 0;
					} else if(value > 2){
						value = 2;
					}
					this.value = value;
				}
				apply();
			}
		}
		,branchCount: {
			elements: [
				 document.getElementById("c-branchCount")
				,document.getElementById("c-branchCountValue")
			]
			,value: 0.5
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					value = Math.round(value);
					if(value < 1){
						value = 1;
					}
					this.value = value;
				}
				apply();
			}
		}
		,gravity: {
			elements: [
				 document.getElementById("c-gravity")
				,document.getElementById("c-gravityValue")
			]
			,value: 0.5
			,update: function(){
				var value = Math.pow(this.elements[0].value, 3);
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					this.value = value;
				}
				apply();
			}
		}
		,elasticity: {
			elements: [
				 document.getElementById("c-elasticity")
				,document.getElementById("c-elasticityValue")
			]
			,value: 13
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					this.value = value;
				}
				apply();
			}
		}
		,density: {
			elements: [
				 document.getElementById("c-density")
				,document.getElementById("c-densityValue")
			]
			,value: 13
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					this.value = value;
				}
				apply();
			}
		}
		,minWidth: {
			elements: [
				 document.getElementById("c-minWidth")
				,document.getElementById("c-minWidthValue")
			]
			,value: 0.5
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					this.value = value;
				}
				apply();
			}
		}
		,maxDepth: {
			elements: [
				 document.getElementById("c-maxDepth")
				,document.getElementById("c-maxDepthValue")
			]
			,value: 0
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					if(value < 1){
						value = 1;
					}
					this.value = value;
				}
				apply();
			}
		}
		,stemAngle: {
			elements: [
				 document.getElementById("c-stemAngle")
				,document.getElementById("c-stemAngleValue")
			]
			,value: 0
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					if(value < 0){
						value = 0;
					} else if(value > 1){
						value = 1;
					}
					this.value = value;
				}
				apply();
			}
		}
		,stemWeight: {
			elements: [
				 document.getElementById("c-stemWeight")
				,document.getElementById("c-stemWeightValue")
			]
			,value: 0
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					if(value < 0){
						value = 0;
					} else if(value > 1){
						value = 1;
					}
					this.value = value;
				}
				apply();
			}
		}
		,branchOverwidth: {
			elements: [
				 document.getElementById("c-branchOverwidth")
				,document.getElementById("c-branchOverwidthValue")
			]
			,value: 0
			,update: function(){
				var value = this.elements[0].value;
				this.elements[1].value = value;
				value = parseFloat(value);
				if(!isNaN(value)){
					if(value < 0){
						value = 0;
					} else if(value > 1){
						value = 1;
					}
					this.value = value;
				}
				apply();
			}
		}
		,keepStructure: {
			elements: [
				 document.getElementById("c-keepStructure")
			]
			,value: true
			,update: function(){
				var value = this.elements[0].checked;
				console.log(value);
				this.value = value;
				apply();
			}
		}
	}
	
	function init(){
		var input;
		for(var i in inputs){
			if(inputs.hasOwnProperty(i)){
				input = inputs[i];
				
				for(var e in input.elements){
					input.elements[e].value = input.value;
					input.elements[e].oninput = input.update.bind(input);
					input.elements[e].onclick = input.update.bind(input);
				}
			}
		}
	}
	
	function loadConfig(config){
		for(var i in config){
			if(config.hasOwnProperty(i)){
				if(inputs.hasOwnProperty(i)){
					inputs[i].value = config[i];
				}
			}
		}
		init();
	}
	loadConfig(presets.default);
	
	function apply(){
		var newConfig = {};
		for(var i in inputs){
			if(inputs.hasOwnProperty(i)){
				newConfig[i] = inputs[i].value;
			}
		}
		Plantgen.generateTrees(newConfig);
	}
};
