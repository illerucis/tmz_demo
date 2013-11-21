function updated3Grid(data, d3Grid)
{

    var sen = 10;
    nodes = [];
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            nodes.push({
                x: i,
                y: j,
                value: Math.log(Math.abs(data[i][j][0] + Number.MIN_VALUE)) / 2.5
            });
        }
    }

    var colorGrayScale = d3.scale.linear()
        .domain([-3.0, -2.5, -2, -1.5, -1.0, -0.5, 0.0])
        .range(["#000000", "#222222", "#444444", 
                "#666666", "#888888", "#AAAAAA", "#CCCCCC"])
    

    var colorScale = d3.scale.linear()
        .domain([-3.0, -2.5, -2, -1.5, -1.0, -0.5, 0.0])
        .range(["#0000FF", "#3333FF", "#33FFFF", 
                "#66FF66", "#FFFF33", "#FF3333", "#990000"])


    d3Grid
        .selectAll('rect')
        .data(nodes)
        .attr('x', function(node){return node.x * sen;})
        .attr('y', function(node){return node.y * sen;})
        .style('fill', function(node)
               {
                   return colorScale(node.value);
               })

}

function getd3Grid(g)
{
    var sen = 10;

    svg = d3.select('body').append('svg')
        .attr('width', 500).attr('height', 400).attr('id', 'bob');

    svg.append('g');

    nodes = [];
    data = g.ez;

    for (var i = 0; i < g.sizeX; i++) {
        for (var j = 0; j < g.sizeY; j++) {
            console.log(data[i][j][0]);
            nodes.push({
                x: i,
                y: j,
                value: Math.abs(data[i][j][0] + Number.MIN_VALUE)
            });
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
            return colorScale(node.value); 
        });

    return svg
 
}
