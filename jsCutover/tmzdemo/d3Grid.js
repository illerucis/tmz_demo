function updated3Grid(g, d3Grid)
{
    var sen = 5;

    nodes = [];
    data = g.ez;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[0].length; j++) {
            if (g.gol[i][j][0] == 1) {
                var node = {
                    x     : i,
                    y     : j,
                    value : g.gol[i][j][1],
                    gol   : true
                };
            }
            else {
                var node = {
                    x     : i, 
                    y     : j,
                    gol   : false,
                    value : Math.log(Math.abs(data[i][j] + Number.MIN_VALUE) / 0.5)
                };

            }
            nodes.push(node);
        }
    }

    var colorGrayScale = d3.scale.linear()
        .domain([-3.0, -2.5, -2, -1.5, -1.0, -0.5, 0.0])
        .range(["#000000", "#222222", "#444444", 
                "#666666", "#888888", "#AAAAAA", "#CCCCCC"])

    var colorScale = d3.scale.linear()
        .domain([0.0, 3.33, 6.66, 9.99, 13.32, 16.65, 20.0])
        .range(["#0000FF", "#3333FF", "#33FFFF", 
                "#66FF66", "#FFFF33", "#FF3333", "#990000"])

    d3Grid
        .selectAll('rect')
        .data(nodes)
        .attr('x', function(node){return node.x * sen;})
        .attr('y', function(node){return node.y * sen;})
        .style('fill', function(node)
               {
                   if (node.gol) { return colorScale(node.value); }
                   else { return colorGrayScale(node.value); }
               })

}

function getd3Grid(g, sizeX, sizeY)
{

    var sen = 5;
    svg = d3.select('body').append('svg')
        .attr('width', 500).attr('height', 400).attr('id', 'bob');

    svg.append('g');
    nodes = [];
    data = g.ez;

    for (var i = 0; i < sizeX; i++) {
        for (var j = 0; j < sizeY; j++) {
            
            var node = {
                x     : i, 
                y     : j,
                gol   : false,
                value : Math.abs(data[i][j] + Number.MIN_VALUE)
            }

            if (g.gol[i][j][0] == 1) {
                node.value = Math.abs(g.gol[i][j][1] + Number.MIN_VALUE);
                node.gol = true;
            }
            nodes.push(node);
        }
    }

    var colorGrayScale = d3.scale.linear()
        .domain([0.0, 1.0])
        .range(["#000000", "#CCCCCC"])

    var colorScale = d3.scale.linear()
        .domain([0.0, 1.0])
        .range(["#0000FF", "#990000"])

    svg
        .selectAll('rect')
        .data(nodes)
        .enter().append('rect')
        .attr('x', function(node){return node.x * sen;})
        .attr('y', function(node){return node.y * sen;})
        .attr('width', sen)
        .attr('height', sen)
        .style('fill', function(node) { 
            if (node.gol) { return colorScale(node.value); }
            else { return colorGrayScale(node.value); }
        });

    return svg
 
}
