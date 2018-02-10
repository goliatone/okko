var max_values = [];

var chart = bb.generate({
  data: {
    columns: [
    	["data1", 47, 89, 47, 66, 47, 141, 66, 47, 122, 100, 141, 89, 173, 122,
                100, 196, 66, 66, 47, 113, 66, 89, 66, 205, 100, 122, 66, 66,
                47, 66, 100, 205, 66, 141, 89, 152, 47, 66, 152, 141, 47, 66,
                89, 100,205, 89, 47, 100, 66, 113, 66, 47, 100, 89, 113, 47,
                66, 100, 47, 113, 100, 89, 47, 66, 47, 89, 66, 89, 100],
    ],
    type: "bar",
    colors: {
      data1: "#8199ab"
    },
    onmax: function (data) {
    	data.forEach(function(v) {
        // var max_el = document.querySelector(".bb-shapes-" + v.id + " .bb-bar-" + v.index);
        // setTimeout(function() {
        //   max_el
        //     .classList.add('max')
        //     .setAttribute("style", "fill:#ff206a;");
        // }, 1000);
        max_values.push(v);
    	});
    }
  },
  axis: {
    x: {
      show: false
    },
    y: {
      show: false
    }
  },
  grid: {
    y: {
      show: true
    }
  },
  legend: {
    show: false
  },
  bar: {
    width: {
      ratio: 0.5
    }
  },
  bindto: "#chart-probe-latency"
});

setTimeout(function() {
  // max_values.forEach(function(v) {
  //     var max_el = document.querySelector(".bb-shapes-" + v.id + " .max.bb-bar-" + v.index);
  //     max_el
  //       .setAttribute("style", "fill:#ff206a;");
  // }
  console.log(max_values);
}, 2000);
