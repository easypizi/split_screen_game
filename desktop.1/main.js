var app = new PIXI.Application({
    autoResize: true,
    resolution: devicePixelRatio,
});

document.body.appendChild(app.view);

var count = 0;

var ropeLength = 918 / 20;

var points = [];

for (var i = 0; i < 20; i++) {
    points.push(new PIXI.Point(i * ropeLength, 0));
}

var strip = new PIXI.mesh.Rope(PIXI.Texture.fromImage('desktop/snake.png'), points);

strip.x = -459;

var snakeContainer = new PIXI.Container();
snakeContainer.x = 400;
snakeContainer.y = 300;

snakeContainer.scale.set(800 / 1100);
app.stage.addChild(snakeContainer);

snakeContainer.addChild(strip);
let mode = "right";

let left = keyboard("ArrowLeft"),
    up = keyboard("ArrowUp"),
    right = keyboard("ArrowRight"),
    down = keyboard("ArrowDown");


//Left arrow key `release` method
left.release = () => {
    mode = "left"
};

up.release = () => {
    mode = "up"
};

right.release = () => {
    mode = "right"
};

down.release = () => {
    mode = "down"
};

app.ticker.add(function () {
    switch (mode) {
        case "left":
            snakeContainer.x -= 6;
            snakeContainer.rotation.x = 0.5;
            snakeContainer.rotation.y = 0.5;
            snakeContainer.rotation = 0.5;
            break;
        case "right":
            snakeContainer.x += 6;
            snakeContainer.rotation = 0;
            break;
        case "down":
            snakeContainer.y += 6;
            snakeContainer.rotation = 0.5;
            break;
        case "up":
            snakeContainer.y -= 6;
            snakeContainer.rotation = 0.5;
            break;
    }

    count += 0.1;

    for (var i = 0; i < points.length; i++) {
        points[i].y = Math.sin((i * 0.5) + count) * 30;
        // points[i].x = i * ropeLength + Math.cos((i * 0.3) + count) * 20;
    }

});

window.addEventListener('resize', resize);

function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    rect.position.set(app.screen.width, app.screen.height);
}

resize();


// KEYBOARD
function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}