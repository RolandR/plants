function initWebGL(canvas){

	var context;

	try {
		// Try to grab the standard context. If it fails, fallback to experimental.
		context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	} catch(e) {}

	if (!context) {
		console.log("Could not get webGL context, switching to normal canvas drawing");
		return false;
	} else {
		
		// Set clear color to transparent
		context.clearColor(0.0, 0.0, 0.0, 0.0);
		
		// Enable depth testing
		context.enable(context.DEPTH_TEST);
		
		// Near things obscure far things
		context.depthFunc(context.LEQUAL);
		
		// Clear the color as well as the depth buffer.
		context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

		if(!initShaders(context)){
			console.log("Unable to initialize the shader program, switching to normal canvas drawing");
			return false;
		}

		initBuffers(context);

		console.log("Using webGL for rendering.");
		return context;
	}
	
}

function initBuffers(context) {
	var squareVerticesBuffer = context.createBuffer();
	context.bindBuffer(context.ARRAY_BUFFER, squareVerticesBuffer);

	var vertices = [
		1.0,  1.0,  0.0,
		-1.0, 1.0,  0.0,
		1.0,  -1.0, 0.0,
		-1.0, -1.0, 0.0
	];

	context.bufferData(context.ARRAY_BUFFER, new Float32Array(vertices), context.STATIC_DRAW);
}

function initShaders(context) {
	var fragmentShader = getShader(context, "fragmentShader");
	var vertexShader = getShader(context, "vertexShader");

	if(!fragmentShader || !vertexShader){
		console.log("Something went wrong with loading the shaders.");
		return false;
	}

	// Create the shader program

	shaderProgram = context.createProgram();
	context.attachShader(shaderProgram, vertexShader);
	context.attachShader(shaderProgram, fragmentShader);
	context.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!context.getProgramParameter(shaderProgram, context.LINK_STATUS)) {
		return false;
	}

	context.useProgram(shaderProgram);

	vertexPositionAttribute = context.getAttribLocation(shaderProgram, "aVertexPosition");
	context.enableVertexAttribArray(vertexPositionAttribute);

	return true;
}

function getShader(context, id) {
	var shaderScript, theSource, currentChild, shader;

	shaderScript = document.getElementById(id);

	if (!shaderScript) {
		return null;
	}

	theSource = "";
	currentChild = shaderScript.firstChild;

	while(currentChild) {
		if (currentChild.nodeType == currentChild.TEXT_NODE) {
			theSource += currentChild.textContent;
		}

		currentChild = currentChild.nextSibling;
	}

	if (shaderScript.type == "x-shader/x-fragment") {
		shader = context.createShader(context.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = context.createShader(context.VERTEX_SHADER);
	} else {
		// Unknown shader type
		return null;
	}

	context.shaderSource(shader, theSource);

	// Compile the shader program
	context.compileShader(shader);  

	// See if it compiled successfully
	if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
		console.log("An error occurred compiling the shaders: " + context.getShaderInfoLog(shader));  
		return null;  
	}

	return shader;
}






