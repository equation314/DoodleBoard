function Graph(document) {
  let canvas = document.getElementById("canvas");
  let ctx = canvas.getContext("2d");
  this.width = canvas.width;
  this.height = canvas.height;
  this.offsetX = canvas.offsetLeft + parseInt(canvas.style.borderBottomWidth);
  this.offsetY = canvas.offsetTop + parseInt(canvas.style.borderBottomWidth);
  let imageData = ctx.getImageData(0, 0, this.width, this.height);
  let currentColor = [0, 0, 0, 255];

  this.getGraphXY = (x, y) => {
    return [x - this.offsetX, y - this.offsetY];
  }

  this.inCanvas = (x, y) => {
    return 0 <= x && x <= this.width && 0 <= y && y <= this.height;
  }

  /*this.setPixel = (x, y, r = currentColor[0],
                           g = currentColor[1],
                           b = currentColor[2],
                           a = currentColor[3]) => {
    let id = ctx.createImageData(1,1);
    let data = id.data;
    data[0] = r;
    data[1] = g;
    data[2] = b;
    data[3] = a;
    ctx.putImageData(id, x, y);
  }*/

  this.setPixel = (x, y, r = currentColor[0],
                         g = currentColor[1],
                         b = currentColor[2],
                         a = currentColor[3]) => {
    if (!this.inCanvas(x, y)) return;
    ctx.fillStyle = `rgba(${r},${g},${b},${a / 255.0})`;
    ctx.fillRect(x, y, 1, 1);
  }


  this.setImagePixel = (data, x, y, r = currentColor[0],
                              g = currentColor[1],
                              b = currentColor[2],
                              a = currentColor[3]) => {
    if (!this.inCanvas(x, y)) return;
    let i = (y * this.width + x) * 4;
    data[i] = r;
    data[i+1] = g;
    data[i+2] = b;
    data[i+3] = a;
    //ctx.putImageData(imageData, 0, 0);
  }

  this.createCache = () => {
    imageData = ctx.getImageData(0, 0, this.width, this.height);
  }

  this.restore = () => {
    ctx.putImageData(imageData, 0, 0);
  }

  this.setCurrentColor = (r, g, b, a = 255) => {
    currentColor = [r, g, b, a];
  }

  function __drawLine(x1, y1, x2, y2, setPixel) {
    let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1), t = 0;
    if (dx < dy) {
      t = x1; x1 = y1; y1 = t;
      t = x2; x2 = y2; y2 = t;
      t = dx; dx = dy; dy = t;
      t = 1;
    }
    let x = x1, y = y1, e = -dx;
    let sgnx = x1 < x2 ? 1 : -1;
    let sgny = y1 < y2 ? 1 : -1;
    if (!t) {
      for (let i = 0; i <= dx; i++) {
        setPixel(x, y);
        x += sgnx;
        e += 2 * dy;
        if (e >= 0) {
          y += sgny;
          e -= 2 * dx;
        }
      }
    } else {
      for (let i = 0; i <= dx; i++) {
        setPixel(y, x);
        x += sgnx;
        e += 2 * dy;
        if (e >= 0) {
          y += sgny;
          e -= 2 * dx;
        }
      }
    }
  }

  function __drawCircle(x, y, r, setPixel) {
    function drawCirclePoints(dx, dy) {
      setPixel(x + dx, y + dy); setPixel(x + dy, y + dx);
      setPixel(x - dx, y + dy); setPixel(x + dy, y - dx);
      setPixel(x + dx, y - dy); setPixel(x - dy, y + dx);
      setPixel(x - dx, y - dy); setPixel(x - dy, y - dx);
    }

    let dx = 0, dy = r, d= 10 - r * 8;
    while (dx <= dy) {
      drawCirclePoints(dx, dy);
      if (d < 0)
        d += 16 * dx + 24;
      else {
        d += 16 * (dx - dy) + 40;
        dy--;
      }
      dx++;
    }
  }

  this.drawLine = (x1, y1, x2, y2) => {
    __drawLine(x1, y1, x2, y2, this.setPixel);
    this.createCache();
  }

  this.drawLineOnCache = (x1, y1, x2, y2) => {
    let cache = ctx.getImageData(0, 0, this.width, this.height);
    __drawLine(x1, y1, x2, y2, (x, y) => {
      this.setImagePixel(cache.data, x, y);
    });
    ctx.putImageData(cache, 0, 0);
  }

  this.drawCircle = (x, y, r) => {
    __drawCircle(x, y, r, this.setPixel);
    this.createCache();
  }

  this.drawCircleOnCache = (x, y, r) => {
    let cache = ctx.getImageData(0, 0, this.width, this.height);
    __drawCircle(x, y, r, (x, y) => {
      this.setImagePixel(cache.data, x, y);
    });
    ctx.putImageData(cache, 0, 0);
  }
}