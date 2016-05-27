
var Plantgen = new function(){
	
	var rand = function(){};
	var trees = [];
	var flatTrees = [];
	
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
		flatTrees = [];
		
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

		for(var i = 0; i < config.treeCount; i++){
			flatTrees.push(flatten(trees[i].structure));
		}
		
		renderer = new Renderer();
		renderer.renderAll();
		
		document.getElementById("branchCount").innerHTML = totalBranchCount;
		if(totalBranchCount >= config.branchLimit){
			document.getElementById("branchCount").className = "branchLimitExceeded";
			document.getElementById("branchLimit").className = "branchLimitExceeded";
		} else {
			document.getElementById("branchCount").className = "";
			document.getElementById("branchLimit").className = "";
		}
	}

	function flatten(branch, parent){
		var flat = [];

		var newparent = {
			 angle: branch.angle
			,bendAngle: branch.angle
			,centerOffset: branch.centerOffset
			,len: branch.len
			,width: branch.width
			,parent: parent
			,end: [0, 0]
			,cosAngle: 0
			,sinAngle: 0
		};
		
		flat.push(newparent);
		
		for(var i in branch.branches){
			if(branch.branches.hasOwnProperty(i)){
				flat = flat.concat(flatten(branch.branches[i], newparent));
			}
		}
		
		return flat;
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

				if(totalBranchCount >= config.branchLimit){
					break;
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

		var context = canvas.getContext("2d");

		window.onresize = function(){
			canvas.width = document.getElementById("container").offsetWidth;
			canvas.height = document.getElementById("container").offsetHeight;
			renderAll();
		};

		var now = window.performance.now();

		var windDirection = degToRad(config.windDirection-180); // -180 so it's relative to positive Y
		var windSpeed = config.windSpeed / 1000;

		var woodDensity = 0.65; // g/cm^3

		var branchWindSpeed;
		var branchWindDirection;
		var windTurbulence;
		var gravityVector;
		var windVector;
		var forceVector;
		var forceAngle;
		var forceScalar;
		var forceAttack;
		var bendDistance;
		var originalY;
		var newY;
		var newX;
		var newAngle;
		var rotation;
		var parentAngle;
		var start;

		var sinParentAngle;
		var cosParentAngle;
		var bezier;
		var xLength;
		var yLength;

		var pi = Math.PI;
		var sin = Math.sin;
		var cos = Math.cos;
		var atan = Math.atan;
		var pow = Math.pow;
		var sqrt = Math.sqrt;

		function renderFlat(flatTree, treePos){
			var last = null;
			var move = true;

			var sinParentRotation;
			var sinParentRotation;
			var targetX;
			var targetY;
			
			for(var i = 0; i < flatTree.length; i++){
				var branch = flatTree[i];

				if(!branch.parent){
					parentAngle = 0;
					start = treePos;
					sinParentAngle = 0;
					cosParentAngle = 1;
					move = true;
				} else {
					parentAngle = branch.parent.bendAngle;
					start = [branch.parent.end[0], branch.parent.end[1]];
					sinParentAngle = branch.parent.sinAngle;
					cosParentAngle = branch.parent.cosAngle;
					if(branch.parent == last){
						move = false;
					} else {
						move = true;
					}
					last = branch;
				}

				if(config.gravity != 0 || config.windSpeed || config.windTurbulence){
						
					// Due to turbulence, branches are affected by wind individually
					branchWindSpeed = windSpeed;
					branchWindDirection = windDirection;

					// Each branch has its own frequency by which it swings in wind turbulence.
					// This way, branches seem to swing individually
					if(!branch.turbulenceFrequency){
						branch.turbulenceFrequency = (500 / (1+config.windSpeed)) + rand() * 300;
					}
					
					windTurbulence =
						sin(now / branch.turbulenceFrequency) // Sinus curve with the branches own frequency
						* config.windTurbulence	// Times the wind turbulence value
						* (1+branchWindSpeed);	// Wind speed increases amplitude
					
					// First, add turbulence depending on wind speed
					branchWindSpeed += windTurbulence * branchWindSpeed;
					// Second, add turbulence that acts even when there's no wind speed
					branchWindSpeed +=
						(
							sin(now / 2000 + branch.turbulenceFrequency/100)
							+ sin(now / 3173 + branch.turbulenceFrequency/100) // Use two waves with different frequencies to make it more irregular
						) * config.windTurbulence / 5000;

					// Calculate branch weight if it hasn't been set before
					if(!branch.weight){
						branch.weight = pi * pow((branch.width)/2, 2) * (branch.len) * woodDensity;
						branch.weight = branch.weight / 1000; // g to kg
					}

					// Split force vectors into x and y components

					gravityVector = [
						0, // x=0, as gravity acts only on the y axis
						config.gravity * branch.weight/2 // gravity force
					];

					windVector = [
						sin(branchWindDirection) * branchWindSpeed * branch.width // We multiply by branch width, so that thicker branches are affected more
						, cos(branchWindDirection) * branchWindSpeed * branch.width
					];

					// Add the two force vectors
					forceVector = [gravityVector[0] + windVector[0], gravityVector[1] + windVector[1]];

					// Calculate angle of combined forces
					forceAngle = 0;
					if(forceVector[1] != 0){
						forceAngle = atan(forceVector[0]/forceVector[1]);
					}
					if(forceVector[1] < 0){
						forceAngle += pi;
					}

					// Calculate value of combined forces
					forceScalar = sqrt(pow(forceVector[0], 2) + pow(forceVector[1], 2));

					// forceAttack is 0 if the force is parallel to the branch, 1 if it's 90°
					forceAttack = sin(branch.angle + parentAngle + forceAngle);

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

					if(!branch.i_y){
						// Calculate second moment of area, based on a circular cross section
						// Multiply by 10e-8 to get m^4 from cm^4
						branch.i_y = (pi / 4) * pow(branch.width, 4) * 10e-8; // Todo: implement thin branch strenght properly
					}

					// Calculation shown above
					bendDistance = ((forceScalar * forceAttack) * pow(forceAttack * (branch.len/100), 3)) / (3 * config.elasticity * branch.i_y);

					// Original y component of the branch relative to the force, before bending
					originalY = cos(branch.angle + parentAngle + forceAngle) * branch.len;

					// Bend
					newY = originalY - bendDistance;

					// X component of the branch relative to the force
					newX = forceAttack*branch.len;

					// Calculate branch angle relative to force after bending
					newAngle = pi/2;
					if(newY != 0){
						newAngle = atan(newX/newY);
					}

					// Rotate back, so that angle is relative to the tree (was relative to force before)
					rotation = (newAngle - forceAngle - parentAngle);

					// Because arcustangens foo
					if(newY < 0){
						rotation += pi;
					}

				} else {
					rotation = branch.angle;
				}

				// Calculate some sin and cos values that will be used multiple times
				sinParentRotation = sin(rotation + parentAngle);
				cosParentRotation = cos(rotation + parentAngle);

				xLength = branch.len * sinParentRotation;
				yLength = branch.len * cosParentRotation;

				//console.log(start, cosParentAngle, sinParentAngle);

				// Calculate offset from center
				start[0] += branch.centerOffset * cosParentAngle;
				start[1] += branch.centerOffset * sinParentAngle;

				// Calculate end point (x and y components from angle and length)
				targetX = start[0] + xLength;
				targetY = start[1] - yLength;

				//console.log(start);

				/*bezier = [
					// First control point, in straight line from previous branch
					 start[0] + branch.len * config.bendiness * sinParentAngle
					,start[1] - branch.len * config.bendiness * cosParentAngle
					// Second control point, in straight line from end of current branch
					,targetX - config.bendiness * xLength
					,targetY + config.bendiness * yLength
					// Target, overshoot by half a pixel, to avoid gaps between branches
					,targetX + 0.5 * sinParentRotation
					,targetY - 0.5 * cosParentRotation
				];

				draw(start, branch.width, bezier);*/


				context.beginPath();
				
				context.moveTo(
					 start[0]
					,start[1]
				);

				context.bezierCurveTo(
					// First control point, in straight line from previous branch
					 start[0] + branch.len * config.bendiness * sinParentAngle
					,start[1] - branch.len * config.bendiness * cosParentAngle
					// Second control point, in straight line from end of current branch
					,targetX - config.bendiness * xLength
					,targetY + config.bendiness * yLength
					// Target, overshoot by half a pixel, to avoid gaps between branches
					,targetX + 0.5 * sinParentRotation
					,targetY - 0.5 * cosParentRotation
				);

				context.lineWidth = branch.width;
				
				context.stroke();
				

				// Keep track of our rotation relative to the entire tree
				branch.bendAngle = parentAngle + rotation;
				branch.end[0] = targetX;
				branch.end[1] = targetY;
				branch.sinAngle = sinParentRotation;
				branch.cosAngle = cosParentRotation;

				
				
				/*for(var i in branch.branches){
					render(branch.branches[i], [targetX, targetY], parentAngle, sinParentRotation, cosParentRotation);
				}*/

				/********************************************************************/
				
			}
		}
		
		
		function render(branch, start, parentAngle, sinParentAngle, cosParentAngle){

			if(config.gravity != 0 || config.windSpeed || config.windTurbulence){

				rotation = calculateForces();
				
				function calculateForces(){
					
					// Due to turbulence, branches are affected by wind individually
					branchWindSpeed = windSpeed;
					branchWindDirection = windDirection;

					// Each branch has its own frequency by which it swings in wind turbulence.
					// This way, branches seem to swing individually
					if(!branch.turbulenceFrequency){
						branch.turbulenceFrequency = (500 / (1+config.windSpeed)) + rand() * 300;
					}
					
					windTurbulence =
						sin(now / branch.turbulenceFrequency) // Sinus curve with the branches own frequency
						* config.windTurbulence	// Times the wind turbulence value
						* (1+branchWindSpeed);	// Wind speed increases amplitude
					
					// First, add turbulence depending on wind speed
					branchWindSpeed += windTurbulence * branchWindSpeed;
					// Second, add turbulence that acts even when there's no wind speed
					branchWindSpeed +=
						(
							sin(now / 2000 + branch.turbulenceFrequency/100)
							+ sin(now / 3173 + branch.turbulenceFrequency/100) // Use two waves with different frequencies to make it more irregular
						) * config.windTurbulence / 5000;

					// Calculate branch weight if it hasn't been set before
					if(!branch.weight){
						branch.weight = pi * pow((branch.width)/2, 2) * (branch.len) * woodDensity;
						branch.weight = branch.weight / 1000; // g to kg
					}

					// Split force vectors into x and y components

					gravityVector = [
						0, // x=0, as gravity acts only on the y axis
						config.gravity * branch.weight/2 // gravity force
					];

					windVector = [
						sin(branchWindDirection) * branchWindSpeed * branch.width // We multiply by branch width, so that thicker branches are affected more
						, cos(branchWindDirection) * branchWindSpeed * branch.width
					];

					// Add the two force vectors
					forceVector = [gravityVector[0] + windVector[0], gravityVector[1] + windVector[1]];

					// Calculate angle of combined forces
					forceAngle = 0;
					if(forceVector[1] != 0){
						forceAngle = atan(forceVector[0]/forceVector[1]);
					}
					if(forceVector[1] < 0){
						forceAngle += pi;
					}

					// Calculate value of combined forces
					forceScalar = sqrt(pow(forceVector[0], 2) + pow(forceVector[1], 2));

					// forceAttack is 0 if the force is parallel to the branch, 1 if it's 90°
					forceAttack = sin(branch.angle + parentAngle + forceAngle);

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

					if(!branch.i_y){
						// Calculate second moment of area, based on a circular cross section
						// Multiply by 10e-8 to get m^4 from cm^4
						branch.i_y = (pi / 4) * pow(branch.width, 4) * 10e-8; // Todo: implement thin branch strenght properly
					}

					// Calculation shown above
					bendDistance = ((forceScalar * forceAttack) * pow(forceAttack * (branch.len/100), 3)) / (3 * config.elasticity * branch.i_y);

					// Original y component of the branch relative to the force, before bending
					originalY = cos(branch.angle + parentAngle + forceAngle) * branch.len;

					// Bend
					newY = originalY - bendDistance;

					// X component of the branch relative to the force
					newX = forceAttack*branch.len;

					// Calculate branch angle relative to force after bending
					newAngle = pi/2;
					if(newY != 0){
						newAngle = atan(newX/newY);
					}

					// Rotate back, so that angle is relative to the tree (was relative to force before)
					rotation = (newAngle - forceAngle - parentAngle);

					// Because arcustangens foo
					if(newY < 0){
						rotation += pi;
					}

					return rotation;
				}

			} else {
				rotation = branch.angle;
			}

			// Calculate some sin and cos values that will be used multiple times
			var sinParentRotation = sin(rotation + parentAngle);
			var cosParentRotation = cos(rotation + parentAngle);

			xLength = branch.len * sinParentRotation;
			yLength = branch.len * cosParentRotation;

			// Calculate offset from center
			start[0] += branch.centerOffset * cosParentAngle;
			start[1] += branch.centerOffset * sinParentAngle;

			// Calculate end point (x and y components from angle and length)
			var targetX = start[0] + xLength;
			var targetY = start[1] - yLength;

			bezier = [
				// First control point, in straight line from previous branch
				 start[0] + branch.len * config.bendiness * sinParentAngle
				,start[1] - branch.len * config.bendiness * cosParentAngle
				// Second control point, in straight line from end of current branch
				,targetX - config.bendiness * xLength
				,targetY + config.bendiness * yLength
				// Target, overshoot by half a pixel, to avoid gaps between branches
				,targetX + 0.5 * sinParentRotation
				,targetY - 0.5 * cosParentRotation
			];

			draw(start, branch.width, bezier);

			// Keep track of our rotation relative to the entire tree
			parentAngle += rotation;
			
			for(var i in branch.branches){
				render(branch.branches[i], [targetX, targetY], parentAngle, sinParentRotation, cosParentRotation);
			}
			
		}

		function draw(start, width, bezier){
			
			context.beginPath();
			
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

			context.lineWidth = width;
			
			context.stroke();
			
		}
		
		function renderAll(){

			context.clearRect(0, 0, canvas.width, canvas.height);

			now = window.performance.now();

			var flat = true;
			
			if(flat){
				for(var i in flatTrees){
					renderFlat(
						 flatTrees[i]
						,[(canvas.width/(config.treeCount+1)) * (~~i+1), canvas.height]
					);
				}
			} else {
				for(var i in trees){
					render(
						 trees[i].structure
						,[(canvas.width/(config.treeCount+1)) * (~~i+1), canvas.height]
						,0
						,0
						,1
					);
				}
			}
		}

		return {
			 renderAll: renderAll
		};
	}

	function wind(){

		if(config.animateWind){
			window.requestAnimationFrame(wind);
			//setTimeout(wind, 1000/120);
		}
		
		renderer.renderAll();
		
	}
	
	return {
		 generateTrees: generateTrees
		,wind: wind
	};
};
