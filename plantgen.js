
var Plantgen = new function(){
	var canvas = document.getElementById("canvas");
	canvas.width = document.getElementById("container").offsetWidth;
	canvas.height = document.getElementById("container").offsetHeight;
	var context = canvas.getContext("2d");
	//context.lineCap = "round";
	
	var rand = function(){};
	var trees = [];
	
	var config = presets.default;
	
	function generateTrees(newConfig){
		config = newConfig;
		rand = new Math.seedrandom(config.seed);
		
		trees = [];
		
		for(var i = 0; i < config.treeCount; i++){
			trees.push(
				{
					structure: {
						 angle: 0
						,width: config.baseWidth
						//,len: config.baseLength
						,len: 
							  config.baseWidth * config.lengthWidthRatio
							+ config.baseWidth * config.lengthWidthRatio * ((rand() - 0.5) * config.lengthRandomness)
							+ config.lengthConstant
						,centerOffset: 0
						,isRoot: true
					}
				}
			);
			
			generateStructure(trees[i]);
		}
		
		renderAll();
	}
	
	generateTrees(config);
	
	function generateStructure(plant){
		function generateLength(previousWidth){
			var length = previousWidth * config.lengthWidthRatio + config.lengthConstant;
			length += length * ((rand() - 0.5) * config.lengthRandomness);
			if(length < 0){
				length = 0;
			}
			return(length);
		}
		
		function distributeWidths(previousWidth, branchCount){
			var widths = [];
			var weights = [];
			var sum = 0;
			// generate weights and calculate sum
			for(var i = 0; i < branchCount; i++){
				var weight = 1 + (rand() - 0.5) * config.widthRandomness;
				weights.push(weight);
				sum += weight;
			}
			// distribute width according to weights
			for(var i = 0; i < branchCount; i++){
				var width = (weights[i] / sum) * previousWidth;
				widths.push(width);
			}
			
			return widths;
		}

		function distributeAngles(branchCount){
			
			var randomAngle = degToRad(config.angleRandomness);
			
			var spanRandomness = degToRad(config.spanRandomness);
			var angleSpan = degToRad(config.angleSpan);
			angleSpan = angleSpan + (rand()-0.5) * spanRandomness;
			
			var angles = [];
			var spanPerBranch = 0;
			if(branchCount > 1){
				spanPerBranch = angleSpan / (branchCount - 1);
			} else {
				spanPerBranch = angleSpan;
			}
			var startingAngle = 0 - angleSpan/2;

			for(var i = 0; i < branchCount; i++){
				var angle = startingAngle + i*spanPerBranch;
				angle += (rand() - 0.5) * randomAngle;
				angles.push(angle);
			}
			return angles;
		}
		
		function addBranches(branch, depth){
			branch.branches = [];

			//var branchCount = Math.ceil(rand() * 3) + 1;
			var branchCount = config.branchCount;
			
			var angles = distributeAngles(branchCount);
			
			var widths = distributeWidths(branch.width, branchCount);
			var widthsSum = 0;
			
			for(var i = 0; i < branchCount; i++){
				// WidthsSum is used to calculate the offset of the new
				// branch from the center of the stem.
				widthsSum += widths[i];
				
				var newBranch = {
					 len: generateLength(branch.width)
					,angle: angles[i]
					,width: widths[i]
					,centerOffset: widthsSum - widths[i]/2 - branch.width/2
				};
				
				branch.branches.push(newBranch);
				
				if(branch.width > branchCount/2 && depth < 15){
					addBranches(newBranch, depth + 1);
				}
			}
		}
		
		addBranches(plant.structure, 2);
	}
	
	function render(branch, start){
		//var targetX = start[0] + Math.sin(branch.angle)*branch.len;
		//var targetY = start[1] - Math.cos(branch.angle)*branch.len;
		
		var targetX = start[0];
		var targetY = start[1] - branch.len
		
		context.save();
		
		context.translate(start[0], start[1]);
		context.rotate(branch.angle);
		context.translate(0-start[0], 0-start[1]);
		
		context.beginPath();
		context.lineWidth = branch.width;
		
		var offsetX = (branch.centerOffset) * Math.cos(branch.angle);
		var offsetY = 0 - (branch.centerOffset) * Math.sin(branch.angle);
		
		context.translate(offsetX, offsetY);
		
		context.moveTo(
			 start[0]
			,start[1]
		);		
		
		context.bezierCurveTo(
			 start[0] + ((branch.len * config.bendiness) * Math.sin(0-branch.angle))
			,start[1] - ((branch.len * config.bendiness) * Math.cos(0-branch.angle))
			,targetX
			,targetY + (branch.len * config.bendiness)
			,targetX
			,targetY-0.5
		);
		context.stroke();
		
		for(var i in branch.branches){
			render(branch.branches[i], [targetX, targetY]);
		}
		
		context.restore();
	}
	
	function renderAll(){
		context.clearRect(0, 0, canvas.width, canvas.height);
		for(var i in trees){
			render(trees[i].structure, [(canvas.width/(config.treeCount+1)) * (~~i+1), canvas.height]);
		}
	}
	
	window.onresize = function(){
		canvas.width = document.getElementById("container").offsetWidth;
		canvas.height = document.getElementById("container").offsetHeight;
		renderAll();
	};
	
	return {
		generateTrees: generateTrees
	};
};