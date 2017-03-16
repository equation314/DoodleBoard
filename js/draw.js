var graph = null;
var downX = -1, downY = -1;
var mouseDown = false;
var currentShape = 0;
var shapes = ['线段', '圆'];

function onMouseDown(event) {
  downX = event.offsetX, downY = event.offsetY;
  mouseDown = true;
}

function onMouseUp(event) {
  if (mouseDown) {
    graph.drawLine(downX, downY, event.offsetX, event.offsetY);
  }
  mouseDown = false;
  downX = -1, downY = -1;
}

function onMouseLeave(event) {
  console.log('fuck');
}

function onMouseMove(event) {
  graph.restore();
  let [x, y] = [event.offsetX, event.offsetY];
  // console.log(x, y, downX, downY);
  if (mouseDown) {
    graph.drawLineOnCache(downX, downY, x, y);
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
  $('#canvas').mouseleave(onMouseLeave);
  $('#canvas').mousemove(onMouseMove);
});