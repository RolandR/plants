
var Plantgen = new function(){
	var canvas = document.getElementById("canvas");
	canvas.width = document.getElementById("container").offsetWidth;
	canvas.height = document.getElementById("container").offsetHeight;
	var context = canvas.getContext("2d");
	
	var rand = function(){};
	var trees = [];
	
	var config = presets.default;

	var renderer = new Renderer();
	
	generateTrees(config);

	if(config.animateWind){
		wind();
	}
	
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
		
		renderer = new Renderer();
		renderer.renderAll();
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

	function Renderer(){

		var now = window.performance.now();

		var windDirection = degToRad(config.windDirection-180);
		var windSpeed = config.windSpeed / 1000;

		var woodDensity = 0.65; // g/cm^3
		
		function render(branch, start, parentAngle){
			
			var rotation;

			if(config.gravity != 0 || config.windSpeed || config.windTurbulence){

				var branchWindSpeed = windSpeed;
				var branchWindDirection = windDirection;

				if(!branch.turbulenceFrequency){
					branch.turbulenceFrequency = (500 / (1+config.windSpeed)) + rand() * 300;
				}
				var windTurbulence = Math.sin(now / branch.turbulenceFrequency) * config.windTurbulence * (1+branchWindSpeed);
				
				//branchWindDirection += branch.windTurbulence * branchWindDirection;
				branchWindSpeed += windTurbulence * branchWindSpeed;
				branchWindSpeed += (Math.sin(now / 2000 + branch.turbulenceFrequency/100) + Math.sin(now / 3173 + branch.turbulenceFrequency/100))* config.windTurbulence / 5000;

				if(!branch.weight){
					branch.weight = Math.PI * Math.pow((branch.width)/2, 2) * (branch.len) * woodDensity;
					branch.weight = branch.weight / 1000; // g to kg
				}
				
				var gravityVector = [0, config.gravity * branch.weight/2];
				var windVector = [Math.sin(branchWindDirection) * branchWindSpeed * branch.width, Math.cos(branchWindDirection) * branchWindSpeed * branch.width];

				var forceVector = [gravityVector[0] + windVector[0], gravityVector[1] + windVector[1]];

				var forceAngle = 0;
				if(forceVector[1] != 0){
					forceAngle = Math.atan(forceVector[0]/forceVector[1]);
				}
				if(forceVector[1] < 0){
					forceAngle += Math.PI;
				}
				var forceScalar = Math.sqrt(Math.pow(forceVector[0], 2) + Math.pow(forceVector[1], 2));

				var forceAttack = Math.sin(branch.angle + parentAngle + forceAngle);

				// fancy physics calculations for how much gravity bends the branch
				
				var i_y = (Math.PI / 4) * Math.pow(branch.width/*/config.thinBranchStrength*/, 4) * 10e-8; // Todo: implement thin branch strenght properly
				
				var bendDistance = ((forceScalar * forceAttack)*Math.pow(forceAttack * (branch.len/100), 3)) / (3 * config.elasticity * i_y);
				
				var originalY = Math.cos(branch.angle + parentAngle + forceAngle) * branch.len;
				var newY = originalY - bendDistance;

				var newX = forceAttack*branch.len;

				var newAngle = Math.PI/2;
				if(newY != 0){
					newAngle = Math.atan(newX/newY);
				}
				
				var rotation = (newAngle - forceAngle - parentAngle);

				if(newY < 0){
					rotation += Math.PI;
				}

			} else {
				rotation = branch.angle;
			}

			// Calculate some sin and cos values that will be used multiple times
			var sinParentAngle = Math.sin(parentAngle);
			var cosParentAngle = Math.cos(parentAngle);
			var sinParentRotation = Math.sin(rotation + parentAngle);
			var cosParentRotation = Math.cos(rotation + parentAngle);

			var offsetX = (branch.centerOffset) * cosParentAngle;
			var offsetY = (branch.centerOffset) * sinParentAngle;

			start[0] += offsetX;
			start[1] += offsetY;

			var targetX = start[0] + sinParentRotation*branch.len;
			var targetY = start[1] - cosParentRotation*branch.len;
			
			context.beginPath();
			context.lineWidth = branch.width;
			
			context.moveTo(
				 start[0]
				,start[1]
			);
			
			context.bezierCurveTo(
				 start[0] + ((branch.len * config.bendiness) * sinParentAngle)
				,start[1] - ((branch.len * config.bendiness) * cosParentAngle)
				,targetX - ((branch.len * config.bendiness) * sinParentRotation)
				,targetY + ((branch.len * config.bendiness) * cosParentRotation)
				,targetX + (0.5 * sinParentRotation) // Overshoot by half a pixel, to avoid gaps between branches
				,targetY - (0.5 * cosParentRotation)
			);
			
			context.stroke();

			parentAngle += rotation;
			
			for(var i in branch.branches){
				render(branch.branches[i], [targetX, targetY], parentAngle);
			}
			
		}
		
		function renderAll(){
			
			context.clearRect(0, 0, canvas.width, canvas.height);

			now = window.performance.now();
			
			for(var i in trees){
				render(
					 trees[i].structure
					,[(canvas.width/(config.treeCount+1)) * (~~i+1), canvas.height]
					,0
				);
			}
		}

		return {
			renderAll: renderAll
		};
	}

	function wind(){

		if(config.animateWind){
			window.requestAnimationFrame(wind);
		}
		
		renderer.renderAll();
		
	}
	
	window.onresize = function(){
		canvas.width = document.getElementById("container").offsetWidth;
		canvas.height = document.getElementById("container").offsetHeight;
		renderer.renderAll();
	};
	
	return {
		 generateTrees: generateTrees
		,wind: wind
	};
};
