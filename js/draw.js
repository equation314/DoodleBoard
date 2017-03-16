var graph = null;
var downX = -1, downY = -1;
var mouseDown = false;
var currentShape = 0;
var shapes = ['线段', '圆'];

function drawShape(x1, y1, x2, y2, onCache = false) {
  if (onCache) graph.restore();
  switch (currentShape) {
  case 0:
    if (onCache)
      graph.drawLineOnCache(x1, y1, x2, y2);
    else
      graph.drawLine(x1, y1, x2, y2);
    break;
  case 1:
    let r = Math.round(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
    if (onCache)
      graph.drawCircleOnCache(x1, y1, r);
    else
      graph.drawCircle(x1, y1, r);
    break;
  }
}

function drawShapeonCache(x1, y1, x2, y2) {
    graph.drawLine(x1, y1, x2, y2);
}

function onMouseDown(event) {
  if (event.button != 0) return;
  if (mouseDown) {
    onMouseUp(event);
    return;
  }
  downX = event.offsetX, downY = event.offsetY;
  mouseDown = true;
}

function onMouseUp(event) {
  if (event.button != 0) return;
  if (mouseDown) {
    drawShape(downX, downY, event.offsetX, event.offsetY);
  }
  mouseDown = false;
  downX = -1, downY = -1;
}

function onMouseMove(event) {
  let [x, y] = [event.offsetX, event.offsetY];
  if (mouseDown) {
    drawShape(downX, downY, x, y, true);
  }
}

function setColor(color) {
  let [r, g, b] = color.split("(")[1].split(")")[0].split(",");
  graph.setCurrentColor(r, g, b);
  $('#color-drop-menu .color-block').css('background-color', color);
}

function setShape(shape) {
  currentShape = shape;
  $('#shape-drop-menu').html(`${shapes[shape]} <span class="caret"></span>`);
}

function init() {
  let colorItems = $('#color-menu').children();
  for (let i = 0; i < colorItems.length; i++) {
    $(colorItems[i]).click((e) => {
      setColor($(e.target).css('background-color'));
    });
  }
}

$(document).ready(() => {
  graph = new Graph(document);
  init();
  setColor('rgb(0,0,0)');

  $('#canvas').mousedown(onMouseDown);
  $('#canvas').mouseup(onMouseUp);
  $('#canvas').mousemove(onMouseMove);
});