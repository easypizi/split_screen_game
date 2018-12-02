/*
 * snake, html5 snake game with pixi.js
 *
 * http://oguzhaneroglu.com/games/snake/
 * https://github.com/rohanrhu/snake
 *
 * Copyright (C) 2017, Oğuzhan Eroğlu <rohanrhu2@gmail.com>
 * Licensed under MIT
 */

var Game = function (parameters) {
    var t_Game = this;
    console.log(t_Game)

    t_Game.parameters = parameters;

    t_Game.events = {};
    t_Game.events.finish = function () {};
    t_Game.events.begin = function () {};
    t_Game.events.pause = function () {};
    t_Game.events.continue = function () {};

    t_Game.playing = false;

    t_Game.app = new PIXI.Application(800, 600, {
        view: t_Game.parameters.view
    });

    t_Game.app.renderer.view.style.position = "fixed";
    t_Game.app.renderer.view.style.display = "block";
    t_Game.app.renderer.view.style.left = "0px";
    t_Game.app.renderer.view.style.top = "0px";

    var onResize = function (event) {
        t_Game.app.renderer.resize(window.innerWidth, window.innerHeight);
    };

    onResize();

    window.addEventListener('resize', onResize);

    t_Game.app.renderer.autoResize = true;
    t_Game.app.renderer.resize(window.innerWidth, window.innerHeight);

    var bg_texture = PIXI.Texture.fromImage('images/bg.png');
    var bg_sprite = new PIXI.TilingSprite(bg_texture, t_Game.app.renderer.width, t_Game.app.renderer.height);

    var bgLayer = new PIXI.Graphics();
    bgLayer.beginFill(0x000000, 0.75);
    bgLayer.drawRect(0, 0, t_Game.app.renderer.width, t_Game.app.renderer.height);

    t_Game.app.stage.addChild(bg_sprite);
    t_Game.app.stage.addChild(bgLayer);

    var snakes = [];

    t_Game.newGame = function () {
        if (t_Game.game !== undefined) {
            t_Game.snake.snline.clear();
            t_Game.snake1.snline.clear();

            t_Game.game.meals.forEach(function (m, mi) {
                m.meal.clear();
            });
        }

        t_Game.game = new SnakeGame.Game({
            app: t_Game.app
        });

        snakes[0] = new Snake(true);
        snakes[1] = new Snake(false);

        t_Game.snake = snakes[0];
        t_Game.snake1 = snakes[1];

        t_Game.game.setSnake(t_Game.snake, t_Game.snake1);
        t_Game.snake.init(t_Game.game, 50, 300);
        t_Game.snake1.init(t_Game.game, 700, 300);

        t_Game.ticker = new PIXI.ticker.Ticker();

        t_Game.ticker.add(function (delta) {
            t_Game.game.placeMeals();

            t_Game.game.step({
                delta: delta
            });

            t_Game.snake.step({
                delta: delta
            });

            t_Game.snake1.step({
                delta: delta
            });

            t_Game.snake.mealCollision({
                delta: delta
            });

            t_Game.snake1.mealCollision({
                delta: delta
            });

            if (t_Game.snake.selfCollision() || t_Game.snake.borderCollision()) {
                t_Game.finish(deviceIds[0]);
            }

            if (t_Game.snake1.selfCollision() || t_Game.snake1.borderCollision()) {
                t_Game.finish(deviceIds[1]);
            }

            if (t_Game.snake.snakeCollision(t_Game.snake1) || t_Game.snake1.snakeCollision(t_Game.snake)) {
                const loser = (t_Game.snake.weight() > t_Game.snake1.weight()) ? deviceIds[1] : deviceIds[0];
                t_Game.finish(loser);
            }
        });
    };

    t_Game.finish = function (loser) {
        t_Game.playing = false;
        t_Game.ticker.stop();

        t_Game.events.finish({
            points: t_Game.snake.points
        });

        socket.emit("game_over", {
            room: gameId,
            loser: loser
        })
    };

    t_Game.stop = function () {
        t_Game.playing = false;
        t_Game.ticker.stop();
    };

    t_Game.pause = function () {
        t_Game.playing = false;
        t_Game.ticker.stop();
        t_Game.events.pause({
            points: t_Game.snake.points
        });
    };

    t_Game.continue = function () {
        t_Game.play();
        t_Game.events.continue();
    };

    t_Game.play = function () {
        t_Game.playing = true;
        t_Game.ticker.start();
        t_Game.events.begin();
    };

    var socket = io({
        transports: ["websocket"],
    })

    var socketId = null;
    var gameId = null;
    var deviceIds = [];

    socket.emit("create_room");

    socket.on("create_room", (data) => {
        gameId = data;
        console.log(data);
        alert(data)
    });

    socket.on("id", (data) => {
        socketId = data;
    });

    socket.on("join_mobile", (data) => {
        deviceIds.push(data);

        if (deviceIds.length == 2) {
            t_Game.newGame();
            t_Game.play();

            setTimeout(() => {
                t_Game.pause();
            }, 50)
        }
    });

    socket.on("up", (data) => {
        console.log("up", data)
        snakes[deviceIds.indexOf(data)].rotate('u');
    })

    socket.on("down", (data) => {
        console.log("down", data)
        snakes[deviceIds.indexOf(data)].rotate('d');
    })

    socket.on("left", (data) => {
        console.log("left", data)
        snakes[deviceIds.indexOf(data)].rotate('l');
    })

    socket.on("right", (data) => {
        console.log("right", data, socketId)
        snakes[deviceIds.indexOf(data)].rotate('r');
    })

    socket.on("pause", (data) => {
        if (t_Game.playing)
            return t_Game.pause();

        t_Game.continue();
    })

    socket.on("start_game", (data) => {
        t_Game.stop();
        t_Game.newGame();
        t_Game.play();
    })
};

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}