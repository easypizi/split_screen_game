var SnakeGame = {};

SnakeGame.Game = function (parameters) {
    this.app = parameters.app;

    this.width = 0;
    this.height = 0;

    this.x = 0;
    this.y = 0;

    this.snake = null;
    this.snake1 = null; // 1 

    this.meals = [];
};

SnakeGame.Game.prototype.setSnake = function (snake, snake1) {
    this.snake = snake;
    this.snake1 = snake;
    this.snake.game = this;
    this.snake1.game = this;
};

SnakeGame.Game.prototype.step = function (parameters) {
    var t_Game = this;

    t_Game.meals.forEach(function (m, mi) {
        m.meal.clear();
        const sizeModificator = 10;

        m.meal.drawRect(m.x, m.y, t_Game.snake.length + sizeModificator, t_Game.snake.length + sizeModificator);
        m.meal.drawRect(m.x, m.y, t_Game.snake1.length + sizeModificator, t_Game.snake1.length + sizeModificator);
    });
};

SnakeGame.Game.prototype.placeMeals = function () {
    if (this.meals.length < 1) {
        var meal = new PIXI.Graphics();
        this.app.stage.addChild(meal);

        meal.beginFill(0x2060C6);

        this.meals.push({
            x: randomInt(15, this.app.renderer.view.width) - 15,
            y: randomInt(15, this.app.renderer.view.height) - 15,
            meal: meal
        });
    }
};

// snake

Snake = function (toRight) {
    var t_Snake = this;
    console.log(t_Snake)

    t_Snake.x = 0;
    t_Snake.y = 0;
    t_Snake.length = 10;
    t_Snake.game = null;
    t_Snake.piece_size = 20;
    t_Snake.ep = null;
    t_Snake.addition = 0.2;
    t_Snake.d = null;
    t_Snake.rds = {
        'l': 'r',
        'r': 'l',
        'd': 'u',
        'u': 'd'
    };

    if (toRight) {
        t_Snake.ss = [
            ['r', 2]
        ]
    } else {
        t_Snake.ss = [
            ['l', 3]
        ]
    }

    t_Snake.points_factor = 10;
    t_Snake.points = 0;
    t_Snake.ss.forEach(function (s, i) {
        t_Snake.points += s[1] * t_Snake.points_factor;
    });
};

Snake.prototype.init = function (game, x, y) {
    this.game = game;

    this.snline = new PIXI.Graphics();
    this.game.app.stage.addChild(this.snline);

    this.x = x || 50; // this is snake start coordinates
    this.y = y || 50; // this is snake start coordinates
};

Snake.prototype.rotate = function (rotation) {
    if (
        (this.d == rotation) ||
        ((this.d == 'l') && (rotation == 'r')) ||
        ((this.d == 'r') && (rotation == 'l')) ||
        ((this.d == 'u') && (rotation == 'd')) ||
        ((this.d == 'd') && (rotation == 'u'))
    ) {
        return false;
    }

    if (this.ss.length > 1) {
        if (
            (this.rds[this.ss[this.ss.length - 2][0]] == rotation) &&
            (this.ss[this.ss.length - 1][1] < 1)
        ) {
            return false;
        }
    }

    this.ss.push([rotation, 0]);

    return true;
};

Snake.prototype.selfCollision = function () {
    var t_Snake = this;

    var collision = false;

    var stx = this.x;
    var sty = this.y;

    var sbx = stx;
    var sby = sty;

    this.ss.slice(0, this.ss.length - 2).forEach(function (s, i) {
        if (s[0] == 'l') {
            stx += (t_Snake.length * s[1]) * -1;
        } else if (s[0] == 'r') {
            stx += t_Snake.length * s[1];
        } else if (s[0] == 'u') {
            sty += (t_Snake.length * s[1]) * -1;
        } else if (s[0] == 'd') {
            sty += t_Snake.length * s[1];
        }

        var diff_x = parseInt(Math.abs(t_Snake.ep.x - stx));
        var diff_y = parseInt(Math.abs(t_Snake.ep.y - sty));

        if ((s[0] == 'u') || (s[0] == 'd')) {
            if (diff_x < (t_Snake.length / 2)) {
                if (s[0] == 'u') {
                    if ((t_Snake.ep.y >= sty) && (t_Snake.ep.y <= sby)) {
                        collision = true;
                        return false;
                    }
                } else if (s[0] == 'd') {
                    if ((t_Snake.ep.y >= sby) && (t_Snake.ep.y <= sty)) {
                        collision = true;
                        return false;
                    }
                }
            }
        } else if ((s[0] == 'l') || (s[0] == 'r')) {
            if (diff_y < (t_Snake.length / 2)) {
                if (s[0] == 'l') {
                    if ((t_Snake.ep.x >= stx) && (t_Snake.ep.x <= sbx)) {
                        collision = true;
                        return false;
                    }
                } else if (s[0] == 'r') {
                    if ((t_Snake.ep.x >= sbx) && (t_Snake.ep.x <= stx)) {
                        collision = true;
                        return false;
                    }
                }
            }
        }

        sbx = stx;
        sby = sty;
    });

    return collision;
};

Snake.prototype.snakeCollision = function (snake) {
    let x = this.x;
    let y = this.y;

    let snakeX = snake.x;
    let snakeY = snake.y;

    let diff_x = parseInt(Math.abs(snakeX - x));
    let diff_y = parseInt(Math.abs(snakeY - y));

    let collision = false;

    console.log("===", snakeX, x, snakeY, y, this.weight(), snake.weight(), snake.length)

    if (diff_x < snake.length && diff_y < snake.length) {
        return true
    }

    this.ss.forEach((s, i) => {
        if (collision)
            return

        if (s[0] == 'l') {
            x += (this.length * s[1]) * -1;
        } else if (s[0] == 'r') {
            x += this.length * s[1];
        } else if (s[0] == 'u') {
            y += (this.length * s[1]) * -1;
        } else if (s[0] == 'd') {
            y += this.length * s[1];
        }

        diff_x = parseInt(snakeX - x);
        diff_y = parseInt(snakeY - y);

        const length = snake.length * 2

        if ((s[0] == 'u') || (s[0] == 'd')) {
            console.log("--- u/d", i, snakeX, x, snakeY, y, this.weight(), snake.weight(), s[1] * snake.length)

            if (s[0] == 'u') {
                if (Math.abs(diff_x) < length && diff_y < s[1] * length && diff_x > 0) {
                    collision = true;
                    return
                }
            } else {
                if (Math.abs(diff_x) < length && diff_y < s[1] * length && diff_x < 0) {
                    collision = true;
                    return
                }
            }
        } else if ((s[0] == 'l') || (s[0] == 'r')) {
            console.log("--- l/r", i, snakeX, x, snakeY, y, this.weight(), snake.weight(), s[1] * snake.length)

            if (s[0] == 'l') {
                if (Math.abs(diff_x) < s[1] * length && diff_y < length && diff_x > 0) {
                    collision = true;
                    return
                }
            } else {
                if (Math.abs(diff_x) < s[1] * length && diff_y < length && diff_x < 0) {
                    collision = true;
                    return
                }
            }
        }
    })

    return collision
}

Snake.prototype.weight = function () {
    let weight = 0;

    this.ss.forEach((s, i) => {
        weight += s[1];
    })

    return weight
}

Snake.prototype.borderCollision = function () {
    var t_Snake = this;

    if (
        (t_Snake.ep.x <= 0) ||
        (t_Snake.ep.x >= t_Snake.game.app.renderer.view.width) ||
        (t_Snake.ep.y <= 0) ||
        (t_Snake.ep.y >= t_Snake.game.app.renderer.view.height)
    ) {
        return true;
    }

    return false;
};

Snake.prototype.mealCollision = function (parameters) {
    var t_Snake = this;

    var collision = false;

    t_Snake.game.meals.forEach(function (m, mi) {
        var mx = m.x + t_Snake.length / 2;
        var my = m.y + t_Snake.length / 2;

        var dx = Math.abs(mx - t_Snake.ep.x);
        var dy = Math.abs(my - t_Snake.ep.y);

        if (
            (dx <= (t_Snake.length)) &&
            (dy <= (t_Snake.length))
        ) {
            t_Snake.game.meals.splice(mi, 1);
            m.meal.clear();
            t_Snake.game.app.stage.removeChild(m.meal);

            var ls = t_Snake.ss[0];
            if (ls[1] <= 0) {
                t_Snake.ss.splice(0, 1);
                ls = t_Snake.ss[0];
            }

            t_Snake.addition += 0.05;
            t_Snake.ss.unshift([ls[0], 5]);

            if (t_Snake.ss[0][0] == 'l') {
                t_Snake.x += t_Snake.length * 5;
            } else if (t_Snake.ss[0][0] == 'r') {
                t_Snake.x -= t_Snake.length * 5;
            } else if (t_Snake.ss[0][0] == 'u') {
                t_Snake.y += t_Snake.length * 5;
            } else if (t_Snake.ss[0][0] == 'd') {
                t_Snake.y -= t_Snake.length * 5;
            }

            t_Snake.points += t_Snake.length * 5;

            collision = true;
            return false;
        }
    });

    return collision;
};

Snake.prototype.step = function (parameters) {
    var t_Snake = this;

    t_Snake.snline.clear();

    t_Snake.snline.x = t_Snake.x;
    t_Snake.snline.y = t_Snake.y;

    t_Snake.snline.moveTo(0, 0);
    t_Snake.snline.lineStyle(t_Snake.length, 0x157518, 1);

    var rx = 0;
    var ry = 0;

    t_Snake.ss.forEach(function (s, i) {
        if (s[0] == 'l') {
            rx += (t_Snake.length * s[1]) * -1;
        } else if (s[0] == 'r') {
            rx += t_Snake.length * s[1];
        } else if (s[0] == 'u') {
            ry += (t_Snake.length * s[1]) * -1;
        } else if (s[0] == 'd') {
            ry += t_Snake.length * s[1];
        }

        t_Snake.snline.lineTo(rx, ry);
    });

    t_Snake.ep = {
        x: t_Snake.x + rx,
        y: t_Snake.y + ry
    };

    t_Snake.d = t_Snake.ss[t_Snake.ss.length - 1][0];

    var a = t_Snake.addition * parameters.delta;

    var decr = function (i, d) {
        if (i > t_Snake.ss.length - 1) {
            return;
        }

        var s0 = t_Snake.ss[i][1] - d;
        t_Snake.ss[i][1] = s0;

        var cd = t_Snake.length;

        if (s0 < 0) {
            cd *= d + s0
        } else {
            cd *= d;
        }

        if (t_Snake.ss[i][0] == 'l') {
            t_Snake.x -= cd;
        } else if (t_Snake.ss[i][0] == 'r') {
            t_Snake.x += cd;
        } else if (t_Snake.ss[i][0] == 'u') {
            t_Snake.y -= cd;
        } else if (t_Snake.ss[i][0] == 'd') {
            t_Snake.y += cd;
        }

        if (t_Snake.ss[i][1] <= 0) {
            t_Snake.ss.splice(i, 1);
        }

        if (s0 < 0) {
            decr(i, s0 * -1);
        }
    };

    decr(0, a);

    t_Snake.ss[t_Snake.ss.length - 1][1] += a;
};