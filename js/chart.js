function chart(data, id, selectButton) {

    const width = 700;
    const height = 500;

    //Specify the color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    //Extract nodes and links from the data
    let links = data.links.filter(function(d) {
        if (d.value < 0) {
            return false; // skip
        }
        return true
    })
    links = links.map(d => ({...d}));
    const nodes = data.nodes.map(d => ({...d}));

    var clicked = []

    //Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.name).distance(80))
        .force("charge", d3.forceManyBody())
        .force("collide", d3.forceCollide(d => Math.log(d.value)*3+1).iterations(10))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("forceX", d3.forceX(width/2).strength(0.05)) // THIS IS ONLY NEED BECAUSE OF "GOLD FIVE" sigh...
        .force("forceY", d3.forceY(height/2).strength(0.05)) // Btw GOLD FIVE actually interacts with RED LEADER in episode 4 so...
        .on("tick", ticked)
    
    /*
    const grid = d3.select('.grid').node()
    ? d3.select('.grid')
     : g.append('g')
      .attr('class', 'grid');
    */
    const svg = d3.select(id).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [20, 0, width+20, height])
        .attr("style", "max-width: 100%; height: auto;")

    //Zooming
        const zoom = d3.zoom()
        .scaleExtent([0.5, 5]) // Min and max zoom levels
        .on("zoom", zoomed); //Zoomed function called when a zoom-event occurs (aka scrolling or clicking)
    
      // Call zoom
      svg.call(zoom);
    
      function zoomed(event) {
        // Update the transform of the graph container based on the zoom event
        link.attr("transform", event.transform);
        node.attr("transform", event.transform);
      }

    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll()
        .data(links)
        .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value) * 1.5)
            .on("mouseover", function(d, i) {
                const data = d.target.__data__
                d3.select(this).attr("stroke-width", 10)
                //tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`<div class="tooltip-imggroup"><img src="../Images/${data.source.name.replace("/","_")}.webp" alt="${data.source.name}" class="tooltip-image" width="100"/><img src="../Images/${data.target.name.replace("/","_")}.webp" alt="${data.target.name}" class="tooltip-image" width="100"/></div>
                <span class="tooltip-title">INTERACTIONS BETWEEN</span><br/><span class="tooltip-name">${data.source.name}</span><br><span class="tooltip-title">AND</span><br/><span class="tooltip-name">${data.target.name}</span><br/>
                            <span class="tooltip-title">Number of interaction: </span><br/><span class="tooltip-name">${data.value}</span>`)
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("stroke-width", Math.sqrt(d.target.__data__.value)*1.5)
                //tooltip.transition().duration(500).style("opacity", 0)
            })

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll()
        .data(nodes)
        .join("circle")
            .attr("r", d => Math.log(d.value)*3)
            .attr("fill", d => color(d.colour))
            .attr("class", d => d.name.replace(/ /g,"_"))
            .on("mouseover", (d, i) => {
                const data = d.target.__data__
                //console.log(d);
                //tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`<img src="../Images/${data.name.replace("/","_")}.webp" alt="${data.name}" class="tooltip-image" width="100"/>
                <span class="tooltip-name">${data.name}</span><br/><span class="tooltip-title">Number of aperances: </span><br/><span class="tooltip-name">${data.value}</span>`)
            })
            .on("mouseout", d => {
                //tooltip.transition().duration(500).style("opacity", 0)
            })
            .on("click", event => handleClick(event))
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

        
    node.append("title")
        .text(d => d.name)


    function handleClick(event) {
        var name = event.target.className.baseVal
        if(!clicked.includes(name)) {
            clicked.push(name)
            d3.selectAll(`.${name}`)
                .style("stroke", "#000")
        } 
        else{
            d3.selectAll(`.${name}`)
                .style("stroke", "#fff")
            const index = clicked.indexOf(name)
            if(index > -1) {
                clicked.splice(index, 1)
            }
        }
            
    }

    //tooltip
    var tooltip = d3.select(".tooltip")

    //set the position attributes of links and nodes on each simulation tick
    function ticked () {
        link
            .attr("x1", d=> d.source.x)
            .attr("y1", d=> d.source.y)
            .attr("x2", d=> d.target.x)
            .attr("y2", d=> d.target.y)

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
    }

    function dragstarted(event) {
        if(!event.active) simulation.alphaTarget(0.3).restart()
        console.log("dragstarted");
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
    }

    function dragged(event) {
        console.log("drag");
        event.subject.fx = event.x
        event.subject.fy = event.y
    }

    function dragended(event) {
        if(!event.active) simulation.alphaTarget(0)
        console.log("dragended");
        event.subject.fx = null
        event.subject.fy = null
    }

    //invalidation.then(() => simulation.stop())

    

    

    return svg.node()

}
