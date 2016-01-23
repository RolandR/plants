
var Plantgen = new function(){
	
	var rand = function(){};
	var trees = [];
	
	var config = presets.default;

	var renderer;
	
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

		var canvas = document.getElementById("canvas");
		canvas.width = document.getElementById("container").offsetWidth;
		canvas.height = document.getElementById("container").offsetHeight;
		var context;
		
		var two = new Two({
			 width: canvas.width
			,height: canvas.height
			,type: Two.Types.canvas
			,domElement: canvas
		});
		
		var webglEnabled = true;
		
		if(!two){
			context = canvas.getContext("2d");
			webglEnabled = false;
		}

		window.onresize = function(){
			canvas.width = document.getElementById("container").offsetWidth;
			canvas.height = document.getElementById("container").offsetHeight;
			if(webglEnabled){
			//	context.viewport(0, 0, canvas.width, canvas.height);
			}
			renderAll();
		};

		var now = window.performance.now();

		var windDirection = degToRad(config.windDirection-180); // -180 so it's relative to positive Y
		var windSpeed = config.windSpeed / 1000;

		var woodDensity = 0.65; // g/cm^3
		
		function render(branch, start, parentAngle){
			
			var rotation;

			if(config.gravity != 0 || config.windSpeed || config.windTurbulence){

				// Due to turbulence, branches are affected by wind individually
				var branchWindSpeed = windSpeed;
				var branchWindDirection = windDirection;

				// Each branch has its own frequency by which it swings in wind turbulence.
				// This way, branches seem to swing individually
				if(!branch.turbulenceFrequency){
					branch.turbulenceFrequency = (500 / (1+config.windSpeed)) + rand() * 300;
				}
				
				var windTurbulence =
					Math.sin(now / branch.turbulenceFrequency) // Sinus curve with the branches own frequency
					* config.windTurbulence	// Times the wind turbulence value
					* (1+branchWindSpeed);	// Wind speed increases amplitude
				
				// First, add turbulence depending on wind speed
				branchWindSpeed += windTurbulence * branchWindSpeed;
				// Second, add turbulence that acts even when there's no wind speed
				branchWindSpeed +=
					(
						Math.sin(now / 2000 + branch.turbulenceFrequency/100)
						+ Math.sin(now / 3173 + branch.turbulenceFrequency/100) // Use two waves with different frequencies to make it more irregular
					) * config.windTurbulence / 5000;

				// Calculate branch weight if it hasn't been set before
				if(!branch.weight){
					branch.weight = Math.PI * Math.pow((branch.width)/2, 2) * (branch.len) * woodDensity;
					branch.weight = branch.weight / 1000; // g to kg
				}

				// Split force vectors into x and y components

				var gravityVector = [
					0, // x=0, as gravity acts only on the y axis
					config.gravity * branch.weight/2 // gravity force
				];

				var windVector = [
					Math.sin(branchWindDirection) * branchWindSpeed * branch.width // We multiply by branch width, so that thicker branches are affected more
					, Math.cos(branchWindDirection) * branchWindSpeed * branch.width
				];

				// Add the two force vectors
				var forceVector = [gravityVector[0] + windVector[0], gravityVector[1] + windVector[1]];

				// Calculate angle of combined forces
				var forceAngle = 0;
				if(forceVector[1] != 0){
					forceAngle = Math.atan(forceVector[0]/forceVector[1]);
				}
				if(forceVector[1] < 0){
					forceAngle += Math.PI;
				}

				// Calculate value of combined forces
				var forceScalar = Math.sqrt(Math.pow(forceVector[0], 2) + Math.pow(forceVector[1], 2));

				// forceAttack is 0 if the force is parallel to the branch, 1 if it's 90°
				var forceAttack = Math.sin(branch.angle + parentAngle + forceAngle);

				// Calculate how much the forces bend the branch
				/*
					                  F * l^3
					Bend distance = -----------
					                 3 * E * Iy

					F: force
					l: length
					E: Elasticity module of the material
					Iy: Second moment of area
				*/

				// Calculate second moment of area, based on a circular cross section
				// Multiply by 10e-8 to get m^4 from cm^4
				var i_y = (Math.PI / 4) * Math.pow(branch.width, 4) * 10e-8; // Todo: implement thin branch strenght properly

				// Calculation shown above
				var bendDistance = ((forceScalar * forceAttack) * Math.pow(forceAttack * (branch.len/100), 3)) / (3 * config.elasticity * i_y);

				// Original y component of the branch relative to the force, before bending
				var originalY = Math.cos(branch.angle + parentAngle + forceAngle) * branch.len;

				// Bend
				var newY = originalY - bendDistance;

				// X component of the branch relative to the force
				var newX = forceAttack*branch.len;

				// Calculate branch angle relative to force after bending
				var newAngle = Math.PI/2;
				if(newY != 0){
					newAngle = Math.atan(newX/newY);
				}

				// Rotate back, so that angle is relative to the tree (was relative to force before)
				var rotation = (newAngle - forceAngle - parentAngle);

				// Because arcustangens foo
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

			// Calculate offset from center
			var offsetX = (branch.centerOffset) * cosParentAngle;
			var offsetY = (branch.centerOffset) * sinParentAngle;

			start[0] += offsetX;
			start[1] += offsetY;

			// Calculate end point (x and y components from angle and length)
			var targetX = start[0] + sinParentRotation*branch.len;
			var targetY = start[1] - cosParentRotation*branch.len;

			var bezier = [
				// First control point, in straight line from previous branch
				 0 + ((branch.len * config.bendiness) * sinParentAngle)
				,0 - ((branch.len * config.bendiness) * cosParentAngle)
				// Second control point, in straight line from end of current branch
				,0 - ((branch.len * config.bendiness) * sinParentRotation)
				,0 + ((branch.len * config.bendiness) * cosParentRotation)
				// Target, overshoot by half a pixel, to avoid gaps between branches
				,targetX + (0.5 * sinParentRotation)
				,targetY - (0.5 * cosParentRotation)
			];

			draw(branch, start, branch.width, bezier);

			// Keep track of our rotation relative to the entire tree
			parentAngle += rotation;
			
			for(var i in branch.branches){
				render(branch.branches[i], [targetX, targetY], parentAngle);
			}
			
		}

		function draw(branch, start, width, bezier){
			if(webglEnabled){

				if(!branch.curve){

					//branch.move = new Two.Anchor(start[0], start[1], 0, 0, 0, 0, Two.Commands.move);
					branch.start = new Two.Anchor(
						 start[0], start[1]
						,0, 0
						,bezier[0], bezier[1]
						,Two.Commands.curve
					);
					
					branch.end = new Two.Anchor(
						 bezier[4], bezier[5]
						,bezier[2], bezier[3]
						,0 ,0
						,Two.Commands.curve
					);
					
					branch.curve = new Two.Path(
						[branch.start, branch.end]
						,false
						,true
					);
					branch.curve.noFill()
					branch.curve.linewidth = width;

					two.scene.add(branch.curve);

				} else {

					branch.start.x = start[0];
					branch.start.y = start[1];
					branch.start.controls.right.x = bezier[0];
					branch.start.controls.right.y = bezier[1];

					branch.end.x = bezier[4];
					branch.end.y = bezier[5];
					branch.start.controls.left.x = bezier[2];
					branch.start.controls.left.y = bezier[3];

				}
			
			} else {
				
				context.beginPath();
				context.lineWidth = width;
				
				context.moveTo(
					 start[0]
					,start[1]
				);
				
				context.bezierCurveTo(
					 bezier[0]
					,bezier[1]
					,bezier[2]
					,bezier[3]
					,bezier[4]
					,bezier[5]
				);
				
				context.stroke();
				
			}
		}
		
		function renderAll(){

			if(webglEnabled){
				
			} else {
				context.clearRect(0, 0, canvas.width, canvas.height);
			}

			now = window.performance.now();
			
			for(var i in trees){
				render(
					 trees[i].structure
					,[(canvas.width/(config.treeCount+1)) * (~~i+1), canvas.height]
					,0
				);
			}

			//two.update();
		}

		function startLoop(){
			two.bind('update', function(frameCount) {
				renderAll();
			}).play();
		}

		return {
			 renderAll: renderAll
			,startLoop: startLoop
		};
	}

	function wind(){

		/*if(config.animateWind){
			window.requestAnimationFrame(wind);
		}*/
		
		//renderer.renderAll();
		renderer.startLoop();
		
	}
	
	return {
		 generateTrees: generateTrees
		,wind: wind
	};
};
