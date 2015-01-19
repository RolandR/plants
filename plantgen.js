var Plantgen = new function(){
	var canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	var context = canvas.getContext("2d");
	context.lineCap = "round";
	
	var plant0 = {
		structure: {
			 len: 100
			,angle: 0
			,width: 30
			,centerOffset: 0
			,isRoot: true
		}
	};

	var plant1 = {
		structure: {
			 len: 100
			,angle: 0
			,width: 30
			,centerOffset: 0
			,isRoot: true
		}
	};

	var plant2 = {
		structure: {
			 len: 100
			,angle: 0
			,width: 30
			,centerOffset: 0
			,isRoot: true
		}
	};
	
	function generateStructure(plant){
		function generateLength(previousLength, branchDepth){
			return(previousLength/((10+branchDepth)/10) * (1 + (Math.random() - 0.5) * 0.3));
		}
		
		function distributeWidths(previousWidth, branchCount){
			var widths = [];
			var weights = [];
			var sum = 0;
			// generate weights and calculate sum
			for(var i = 0; i < branchCount; i++){
				var weight = 1 + (Math.random() - 0.5) * 0.5;
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

		function distributeAngles(branchCount, span){
			var angles = [];
			var spanPerBranch = span / branchCount;
			var startingAngle = 0 - span/2;

			for(var i = 0; i < branchCount; i++){
				angles.push(startingAngle + i*spanPerBranch);
			}
			return angles;
		}
		
		function addBranches(branch, depth){
			branch.branches = [];

			//var branchCount = Math.ceil(Math.random() * 3) + 1;
			var branchCount = 4;

			var angles = distributeAngles(branchCount, 90/(180/Math.PI));
			
			var widths = distributeWidths(branch.width, branchCount);
			var widthsSum = 0;
			
			for(var i = 0; i < branchCount; i++){
				// WidthsSum is used to calculate the offset of the new
				// branch from the center of the stem.
				widthsSum += widths[i];
				
				var newBranch = {
					 len: generateLength(branch.len, depth)
					,angle: angles[i]
					,width: widths[i]
					,centerOffset: widthsSum - widths[i]/2 - branch.width/2
				};
				
				branch.branches.push(newBranch);
				
				if(branch.width > 1 && depth > 15){
					addBranches(newBranch, depth + 1);
				}
			}
		}
		
		addBranches(plant.structure, 2);
	}
	
	generateStructure(plant0);
	generateStructure(plant1);
	generateStructure(plant2);
	
	function render(branch, start){
		var targetX = start[0] + Math.sin(branch.angle)*branch.len;
		var targetY = start[1] - Math.cos(branch.angle)*branch.len;
		
		context.save();
		
		context.translate(start[0], start[1]);
		context.rotate(branch.angle);
		context.translate(0-start[0], 0-start[1]);
		
		context.beginPath();
		context.lineWidth = branch.width;
		context.moveTo(start[0] + branch.centerOffset, start[1] + branch.width/2);
		context.lineTo(targetX, targetY);
		context.stroke();		
		
		for(var i in branch.branches){
			render(branch.branches[i], [targetX, targetY]);
		}
		
		context.restore();
	}
	
	render(plant0.structure, [canvas.width/4 * 1, canvas.height]);
	render(plant1.structure, [canvas.width/4 * 2, canvas.height]);
	render(plant2.structure, [canvas.width/4 * 3, canvas.height]);
}