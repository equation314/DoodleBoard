var graph = null;
var downX = -1, downY = -1;
var mouseDown = false;

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

$(document).ready(() => {
  graph = new Graph(document);
  graph.setCurrentColor(0, 255, 0);
  for (let i = 0; i < 500; i++)
    graph.setPixel(i, Math.round(i/2));

  graph.drawLine(200, 200, 406, 192);

  console.log('fuck');

  $('#canvas').mousedown(onMouseDown);
  $('#canvas').mouseup(onMouseUp);
  $('#canvas').mouseleave(onMouseLeave);
  $('#canvas').mousemove(onMouseMove);
});