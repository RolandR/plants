
var Plantgen = new function(){
	var canvas = document.getElementById("canvas");
	canvas.width = document.getElementById("container").offsetWidth;
	canvas.height = document.getElementById("container").offsetHeight;
	var context = canvas.getContext("2d");
	
	var rand = function(){};
	var trees = [];
	
	var config = presets.default;

	generateTrees(config);
	
	function generateTrees(newConfig){
		config = newConfig;
		rand = new Math.seedrandom(config.seed);
		
		trees = [];
		
		var totalBranchCount = 0;
		
		for(var i = 0; i < config.treeCount; i++){
			
			var baseWidth = config.baseWidth + config.baseWidth * (rand() - 0.5) * config.widthRandomness;
			
			trees.push(
				{
					structure: {
						 angle: 0 + degToRad(config.angleRandomness) * (rand() - 0.5)
						,width: baseWidth
						,len: 
							  baseWidth * config.lengthWidthRatio
							+ baseWidth * config.lengthWidthRatio * ((rand() - 0.5) * config.lengthRandomness)
							+ config.lengthConstant
						,centerOffset: 0
						,isRoot: true
					}
				}
			);
			
			totalBranchCount += generateStructure(trees[i]);
		}
		
		renderAll();
		document.getElementById("branchCount").innerHTML = totalBranchCount;
	}
	
	function generateStructure(plant){
		
		var totalBranchCount = 1; // One branch already exists
		
		function generateLength(previousWidth){
			var length = previousWidth * config.lengthWidthRatio + config.lengthConstant;
			length += length * ((rand() - 0.5) * config.lengthRandomness);
			if(length < 0){
				length = 0;
			}
			return(length);
		}
		
		function distributeWidths(previousWidth, branchCount, stemNo){
			var widths = [];
			var weights = [];
			var sum = 0;
			// generate weights and calculate sum
			for(var i = 0; i < branchCount; i++){
				var weight = 1 + (rand() - 0.5) * config.widthRandomness;
				if(i != stemNo){
					weight -= weight * config.stemWeight;
				}
				weights.push(weight);
				sum += weight;
			}
			// distribute width according to weights
			for(var i = 0; i < branchCount; i++){
				var width = (weights[i] / sum) * previousWidth;
				width += (previousWidth - width) * config.branchOverwidth;
				widths.push(width);
			}
			
			return widths;
		}

		function distributeAngles(branchCount, stemNo){
			
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
				angles.push(angle);
			}
			
			var stemAngle = angles[stemNo];
			
			for(var i = 0; i < branchCount; i++){
				angles[i] = (angles[i] - (stemAngle) * config.stemAngle);
				angles[i] += (rand() - 0.5) * randomAngle;
			}
			return angles;
		}
		
		function addBranches(branch, depth){
			
			branch.branches = [];

			var branchCount = config.branchCount;
			var stemNo = depth % branchCount;
			var angles = distributeAngles(branchCount, stemNo);
			var widths = distributeWidths(branch.width, branchCount, stemNo);
			
			for(var i = 0; i < branchCount; i++){
				
				if(widths[i] < config.minWidth){

					if(config.keepStructure){
						// Here, we do all rand() calls that would have done if minimum width weren't in place
						var endBranches = Math.pow(branchCount, (config.maxDepth - depth))
						var skippedBranchings = endBranches - 1;

						var randCallsPerBranching = 1 + 3 * branchCount;

						var randCallsSkipped = randCallsPerBranching * skippedBranchings + 1;

						while(randCallsSkipped--){
							rand();
						}
					}
					
					continue;
				}
				
				totalBranchCount++;
				
				var centersSpan = branch.width - widths[0]/2 - widths[branchCount-1]/2;
				var centerOffset = (i / (branchCount-1)) * centersSpan + widths[0]/2 - branch.width/2;
				
				var newBranch = {
					 len: generateLength(branch.width)
					,angle: angles[i]
					,width: widths[i]
					,centerOffset: centerOffset
				};
				
				branch.branches.push(newBranch);
				
				if(depth < config.maxDepth){
					addBranches(newBranch, depth + 1);
				}
			}
		}
		
		addBranches(plant.structure, 2);
		
		return totalBranchCount;
	}
	
	function render(branch, start, up){
		//var targetX = start[0] + Math.sin(branch.angle)*branch.len;
		//var targetY = start[1] - Math.cos(branch.angle)*branch.len;
		
		var targetX = start[0];
		var targetY = start[1] - branch.len;
		
		context.save();

		var rotation;

		if(controls.gravity != 0){

			var gravityAttack = Math.sin(up + branch.angle);

			var woodDensity = 0.65; // g/cm^3

			// fancy physics calculations for how much gravity bends the branch
			var branchWeight = Math.PI * Math.pow((branch.width)/2, 2) * (branch.len) * woodDensity;
			branchWeight = branchWeight / 1000; // g to kg
			
			var i_y = (Math.PI / 4) * Math.pow(branch.width, 4) * 10e-8;
			
			var bendDistance = ((config.gravity * gravityAttack * (branchWeight/2))*Math.pow(gravityAttack * (branch.len/100), 3)) / (3 * config.elasticity * i_y);
			
			var originalY = Math.cos(up + branch.angle) * branch.len;
			var newY = originalY - bendDistance;

			var newX = gravityAttack*branch.len;

			var newAngle = Math.PI/2;
			if(newY != 0){
				newAngle = Math.atan(newX/newY);
			}
			
			var rotation = (newAngle - up);

			if(newY < 0){
				rotation += Math.PI;
			}
			
			up = up + rotation;

		} else {
			rotation = branch.angle;
		}
		
		context.translate(start[0], start[1]);
		context.rotate(rotation);
		context.translate(0-start[0], 0-start[1]);
		
		context.beginPath();
		context.lineWidth = branch.width;
		
		var offsetX = (branch.centerOffset) * Math.cos(rotation);
		var offsetY = 0 - (branch.centerOffset) * Math.sin(rotation);
		
		context.translate(offsetX, offsetY);
		
		context.moveTo(
			 start[0]
			,start[1]
		);		
		
		context.bezierCurveTo(
			 start[0] + ((branch.len * config.bendiness) * Math.sin(0-rotation))
			,start[1] - ((branch.len * config.bendiness) * Math.cos(0-rotation))
			,targetX
			,targetY + (branch.len * config.bendiness)
			,targetX
			,targetY-0.5
		);
		
		context.stroke();

		// Debug: Show up lines
			/*context.beginPath();
			context.lineWidth = 1;
			context.strokeStyle = '#FF0000';
			context.translate(start[0], start[1]);
			context.rotate(0-up);
			context.translate(0-start[0], 0-start[1]);
			context.moveTo(
				 start[0]
				,start[1]
			);
			var debugY = start[1] - originalY;
			context.lineTo(
				 targetX
				,debugY
			);
			context.translate(start[0], start[1]);
			context.rotate(up);
			context.translate(0-start[0], 0-start[1]);
			context.stroke();
			context.strokeStyle = '#000000';*/
		// End Debug
		
		for(var i in branch.branches){
			render(branch.branches[i], [targetX, targetY], up);
		}
		
		context.restore();
	}
	
	function renderAll(){
		context.clearRect(0, 0, canvas.width, canvas.height);
		for(var i in trees){
			render(
				 trees[i].structure
				,[(canvas.width/(config.treeCount+1)) * (~~i+1), canvas.height]
				,0
			);
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
